# ExtremaduraStats
# Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
"""
Jugadores — CRUD completo.
Sirve como patrón para el resto de endpoints.

GET  /jugadores          → lista (público)
GET  /jugadores/{id}     → detalle (público)
POST /jugadores          → crear (protegido)
PUT  /jugadores/{id}     → actualizar (protegido)
DELETE /jugadores/{id}   → eliminar (protegido)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, ValidationError
from datetime import date
from typing import Optional

from app.db.session import get_db
from app.models.models import Jugador, PieDominante
from app.core.deps import get_current_user_id

from sqlalchemy import func, and_, or_
from app.models.models import (
    Jugador, PieDominante, GolPartido, TarjetaPartido, Alineacion,
    JugadorTemporada, JugadorPosicion, Posicion, Partido, EstadoPartido,
    CompeticionTemporada, Temporada, TipoGol, RolPosicion
)

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class JugadorBase(BaseModel):
    nombre: str
    apellidos: str
    nacionalidad: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    ruta_foto: Optional[str] = None
    pie_dominante: Optional[PieDominante] = None
    altura: Optional[int] = None
    peso: Optional[int] = None
    localidad_nacimiento: Optional[str] = None
    pais_nacimiento: Optional[str] = None


class JugadorCreate(JugadorBase):
    pass


class JugadorUpdate(JugadorBase):
    nombre: Optional[str] = None
    apellidos: Optional[str] = None


class JugadorOut(JugadorBase):
    id: int

    class Config:
        from_attributes = True

class JugadorSimpleOut(BaseModel):
    id: int
    nombre_conocido: Optional[str]
    nombre: str
    apellidos: str
    
    @property
    def nombre_completo(self) -> str:
        return self.nombre_conocido or f"{self.nombre} {self.apellidos}"

    class Config:
        from_attributes = True

class PosicionOut(BaseModel):
    id: int
    nombre: str
    abreviacion: str
    rol: str
    es_posicion_principal: bool

    class Config:
        from_attributes = True

class TemporadaJugadorOut(BaseModel):
    temporada_id: int
    nombre_temporada: str
    dorsal: Optional[int]
    estado: str
    partidos_jugados: int = 0
    goles: int = 0
    asistencias: int = 0
    tarjetas_amarillas: int = 0
    tarjetas_rojas: int = 0

    class Config:
        from_attributes = True

class EstadisticasJugadorOut(BaseModel):
    goles: int
    goles_penalti: int
    asistencias: int
    partidos_jugados: int = 0
    partidos_titular: int = 0
    partidos_suplente: int = 0
    tarjetas_amarillas: int
    tarjetas_rojas: int


class JugadorDetalleOut(JugadorBase):
    id: int
    nombre_conocido: Optional[str] = None
    posiciones: list[PosicionOut] = []
    temporadas: list[TemporadaJugadorOut] = []
    estadisticas: EstadisticasJugadorOut

    class Config:
        from_attributes = True

class JugadorHistoricoOut(BaseModel):
    id: int
    nombre: str
    apellidos: str
    nombre_conocido: Optional[str] = None
    nacionalidad: Optional[str] = None
    localidad_nacimiento: Optional[str] = None
    pais_nacimiento: Optional[str] = None
    ruta_foto: Optional[str] = None
    
    # Métricas agregadas calculadas en la query
    total_partidos: int
    total_goles: int
    total_asistencias: int
    total_tarjetas: int
    total_temporadas: int

    class Config:
        from_attributes = True


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/", response_model=list[JugadorOut])
def list_jugadores(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    return db.query(Jugador).offset(skip).limit(limit).all()

@router.get("/historico", response_model=list[JugadorHistoricoOut])
def list_jugadores_historico(db: Session = Depends(get_db)):
    """
    Devuelve la lista completa de jugadores históricos con sus agregados estadísticos
    calculados eficientemente desde la base de datos para la vista del listado general.
    """
    
    # 1. Subconsulta: Partidos Jugados (Titular o Suplente que llegó a entrar)
    subq_partidos = (
        db.query(func.count(Alineacion.id))
        .join(Partido, Partido.id == Alineacion.partido)
        .filter(
            Alineacion.jugador == Jugador.id,
            Partido.estado == EstadoPartido.jugado,
            or_(
                Alineacion.titular == True,
                and_(Alineacion.titular == False, Alineacion.minuto_entrada.isnot(None))
            )
        )
        .scalar_subquery()
    )

    # 2. Subconsulta: Goles Marcados (a favor)
    subq_goles = (
        db.query(func.count(GolPartido.id))
        .filter(
            GolPartido.anotador == Jugador.id, 
            GolPartido.a_favor == True
        )
        .scalar_subquery()
    )

    # 3. Subconsulta: Asistencias dadas
    subq_asistencias = (
        db.query(func.count(GolPartido.id))
        .filter(GolPartido.asistente == Jugador.id)
        .scalar_subquery()
    )

    # 4. Subconsulta: Tarjetas totales (Amarillas, rojas y dobles amarillas)
    subq_tarjetas = (
        db.query(func.count(TarjetaPartido.id))
        .filter(TarjetaPartido.jugador == Jugador.id)
        .scalar_subquery()
    )

    # 5. Subconsulta: Total de temporadas vinculadas al club
    subq_temporadas = (
        db.query(func.count(JugadorTemporada.id))
        .filter(JugadorTemporada.jugador == Jugador.id)
        .scalar_subquery()
    )

    # 6. Consulta maestra unificando al jugador con sus subconsultas aliadas
    resultados = (
        db.query(
            Jugador,
            func.coalesce(subq_partidos, 0).label("total_partidos"),
            func.coalesce(subq_goles, 0).label("total_goles"),
            func.coalesce(subq_asistencias, 0).label("total_asistencias"),
            func.coalesce(subq_tarjetas, 0).label("total_tarjetas"),
            func.coalesce(subq_temporadas, 0).label("total_temporadas")
        )
        .filter(
            db.query(JugadorTemporada)
            .filter(JugadorTemporada.jugador == Jugador.id)
            .exists()
        )
        .all()
    )

    # 7. Mapeamos la tupla (Jugador, stats...) al formato esperado por el response_model
    lista_historico = []
    for jugador, partidos, goles, asistencias, tarjetas, temporadas in resultados:
        item = JugadorHistoricoOut(
            id=jugador.id,
            nombre=jugador.nombre,
            apellidos=jugador.apellidos,
            nombre_conocido=jugador.nombre_conocido,
            nacionalidad=jugador.nacionalidad,
            localidad_nacimiento=jugador.localidad_nacimiento,
            pais_nacimiento=jugador.pais_nacimiento,
            ruta_foto=jugador.ruta_foto,
            total_partidos=int(partidos),
            total_goles=int(goles),
            total_asistencias=int(asistencias),
            total_tarjetas=int(tarjetas),
            total_temporadas=int(temporadas),
        )
        lista_historico.append(item)

    return lista_historico

@router.get("/{jugador_id}", response_model=JugadorOut)
def get_jugador(jugador_id: int, db: Session = Depends(get_db)):
    jugador = db.get(Jugador, jugador_id)
    if not jugador:
        raise HTTPException(status_code=404, detail="Jugador no encontrado")
    return jugador


@router.get("/detalles/{jugador_id}", response_model=JugadorDetalleOut)
def get_jugador_detalles(jugador_id: int, db: Session = Depends(get_db)):
    jugador = db.get(Jugador, jugador_id)
    if not jugador:
        raise HTTPException(status_code=404, detail="Jugador no encontrado")

    # Partidos como titular
    titulares = db.query(func.count(Alineacion.id))\
        .join(Partido, Partido.id == Alineacion.partido)\
        .filter(
            Alineacion.jugador == jugador_id,
            Partido.estado == EstadoPartido.jugado,
            Alineacion.titular == True,
        )\
        .scalar() or 0

    # Partidos como suplente que entró
    suplentes = db.query(func.count(Alineacion.id))\
        .join(Partido, Partido.id == Alineacion.partido)\
        .filter(
            Alineacion.jugador == jugador_id,
            Partido.estado == EstadoPartido.jugado,
            Alineacion.titular == False,
            Alineacion.minuto_entrada.isnot(None),
        )\
        .scalar() or 0

    # Goles totales a favor
    goles = db.query(func.count(GolPartido.id))\
        .filter(GolPartido.anotador == jugador_id, GolPartido.a_favor == True)\
        .scalar() or 0

    # Goles de penalti
    goles_penalti = db.query(func.count(GolPartido.id))\
        .filter(GolPartido.anotador == jugador_id, GolPartido.a_favor == True, GolPartido.tipo == TipoGol.penalti)\
        .scalar() or 0

    # Asistencias
    asistencias = db.query(func.count(GolPartido.id))\
        .filter(GolPartido.asistente == jugador_id)\
        .scalar() or 0

    # Tarjetas
    tarjetas = db.query(TarjetaPartido.tipo, func.count().label("n"))\
        .filter(TarjetaPartido.jugador == jugador_id)\
        .group_by(TarjetaPartido.tipo)\
        .all()
    amarillas = sum(r.n for r in tarjetas if r.tipo in ("amarilla", "doble_amarilla"))
    rojas = sum(r.n for r in tarjetas if r.tipo == "roja")

    # Posiciones
    posiciones_rel = db.query(JugadorPosicion)\
        .join(Posicion)\
        .filter(JugadorPosicion.jugador == jugador_id)\
        .all()
    posiciones = [
        PosicionOut(
            id=jp.posicion_rel.id,
            nombre=jp.posicion_rel.nombre,
            abreviacion=jp.posicion_rel.abreviacion,
            rol=jp.posicion_rel.rol.value,
            es_posicion_principal=jp.es_posicion_principal
        )
        for jp in posiciones_rel
    ]

    #Temporadass
    temporadas_rel = db.query(JugadorTemporada)\
        .join(Temporada, Temporada.id == JugadorTemporada.temporada)\
        .filter(JugadorTemporada.jugador == jugador_id)\
        .all()

    # Obtener IDs de las temporadas del jugador para filtrar las agrupaciones
    temp_ids = [jt.temporada for jt in temporadas_rel]

    # 1. Partidos por temporada
    partidos_t = db.query(CompeticionTemporada.temporada, func.count(Alineacion.id).label("n"))\
        .join(Partido, Partido.competicion_temporada == CompeticionTemporada.id)\
        .join(Alineacion, Alineacion.partido == Partido.id)\
        .filter(
            Alineacion.jugador == jugador_id,
            Partido.estado == EstadoPartido.jugado,
            CompeticionTemporada.temporada.in_(temp_ids),
            or_(Alineacion.titular == True, and_(Alineacion.titular == False, Alineacion.minuto_entrada.isnot(None)))
        )\
        .group_by(CompeticionTemporada.temporada).all()
    partidos_map = {r.temporada: r.n for r in partidos_t}

    # 2. Goles por temporada
    goles_t = db.query(CompeticionTemporada.temporada, func.count(GolPartido.id).label("n"))\
        .join(Partido, Partido.id == GolPartido.partido)\
        .join(CompeticionTemporada, CompeticionTemporada.id == Partido.competicion_temporada)\
        .filter(GolPartido.anotador == jugador_id, GolPartido.a_favor == True, CompeticionTemporada.temporada.in_(temp_ids))\
        .group_by(CompeticionTemporada.temporada).all()
    goles_map = {r.temporada: r.n for r in goles_t}

    # 3. Asistencias por temporada
    asist_t = db.query(CompeticionTemporada.temporada, func.count(GolPartido.id).label("n"))\
        .join(Partido, Partido.id == GolPartido.partido)\
        .join(CompeticionTemporada, CompeticionTemporada.id == Partido.competicion_temporada)\
        .filter(GolPartido.asistente == jugador_id, CompeticionTemporada.temporada.in_(temp_ids))\
        .group_by(CompeticionTemporada.temporada).all()
    asist_map = {r.temporada: r.n for r in asist_t}

    # 4. Tarjetas por temporada
    tarjetas_t = db.query(CompeticionTemporada.temporada, TarjetaPartido.tipo, func.count().label("n"))\
        .join(Partido, Partido.id == TarjetaPartido.partido)\
        .join(CompeticionTemporada, CompeticionTemporada.id == Partido.competicion_temporada)\
        .filter(TarjetaPartido.jugador == jugador_id, CompeticionTemporada.temporada.in_(temp_ids))\
        .group_by(CompeticionTemporada.temporada, TarjetaPartido.tipo).all()
    
    amarillas_map = {}
    rojas_map = {}
    for r in tarjetas_t:
        if r.tipo in ("amarilla", "doble_amarilla"):
            amarillas_map[r.temporada] = amarillas_map.get(r.temporada, 0) + r.n
        else:
            rojas_map[r.temporada] = rojas_map.get(r.temporada, 0) + r.n

    # Construir la lista final para el response model
    temporadas = [
        TemporadaJugadorOut(
            temporada_id=jt.temporada,
            nombre_temporada=jt.temporada_rel.nombre,
            dorsal=jt.dorsal,
            estado=jt.estado,
            partidos_jugados=partidos_map.get(jt.temporada, 0),
            goles=goles_map.get(jt.temporada, 0),
            asistencias=asist_map.get(jt.temporada, 0),
            tarjetas_amarillas=amarillas_map.get(jt.temporada, 0),
            tarjetas_rojas=rojas_map.get(jt.temporada, 0),
        )
        for jt in temporadas_rel
    ]

    return JugadorDetalleOut(
        **{c.name: getattr(jugador, c.name) for c in jugador.__table__.columns},
        posiciones=posiciones,
        temporadas=temporadas,
        estadisticas=EstadisticasJugadorOut(
            goles=goles,
            goles_penalti=goles_penalti,
            asistencias=asistencias,
            partidos_jugados=titulares + suplentes,
            partidos_titular=titulares,
            partidos_suplente=suplentes,
            tarjetas_amarillas=amarillas,
            tarjetas_rojas=rojas,
        )
    )

@router.post("/", response_model=JugadorOut, status_code=status.HTTP_201_CREATED)
def create_jugador(
    data: JugadorCreate,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_user_id),
):
    jugador = Jugador(**data.model_dump())
    db.add(jugador)
    db.commit()
    db.refresh(jugador)
    return jugador


@router.put("/{jugador_id}", response_model=JugadorOut)
def update_jugador(
    jugador_id: int,
    data: JugadorUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_user_id),
):
    jugador = db.get(Jugador, jugador_id)
    if not jugador:
        raise HTTPException(status_code=404, detail="Jugador no encontrado")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(jugador, field, value)
    db.commit()
    db.refresh(jugador)
    return jugador


@router.delete("/{jugador_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_jugador(
    jugador_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_user_id),   # protegido
):
    jugador = db.get(Jugador, jugador_id)
    if not jugador:
        raise HTTPException(status_code=404, detail="Jugador no encontrado")
    db.delete(jugador)
    db.commit()