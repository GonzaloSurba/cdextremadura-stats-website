# ExtremaduraStats
# Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
"""
Estadísticas calculadas dinámicamente desde los datos de partidos.
No hay tabla en BD — todo se calcula con queries agregadas.
"""

import functools
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import func, and_, or_, case
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from pydantic import BaseModel

from app.db.session import get_db
from app.models.models import (
    Partido, GolPartido, TarjetaPartido, Alineacion,
    Jugador, Equipo, CompeticionTemporada, EstadoPartido, Trofeo,
    JugadorPosicion, Posicion
)

router = APIRouter()


# ── Schemas de respuesta ──────────────────────────────────────────────────────

class ClasificacionEquipo(BaseModel):
    equipo_id: int
    equipo_nombre: str
    abreviacion: str
    nombre_corto: str
    pj: int
    pg: int
    pe: int
    pp: int
    gf: int
    gc: int
    dg: int
    pts: int

class PosicionJugadorOut(BaseModel):
    id: int
    nombre: str
    abreviacion: str
    es_posicion_principal: bool

    class Config:
        from_attributes = True

class EstadisticaJugador(BaseModel):
    jugador_id: int
    nombre: str
    nombre_conocido: Optional[str]
    apellidos: str
    ruta_foto: Optional[str] = None
    goles: int
    goles_penalti: int = 0
    asistencias: int
    tarjetas_amarillas: int
    tarjetas_rojas: int
    partidos_jugados: int
    partidos_titular: int = 0
    partidos_suplente: int = 0
    posiciones: Optional[list[PosicionJugadorOut]] = []


# ── Clasificación ─────────────────────────────────────────────────────────────

@router.get("/clasificacion", response_model=list[ClasificacionEquipo])
def get_clasificacion(
    competicion_temporada_id: int = Query(..., description="ID de competicion_temporada"),
    db: Session = Depends(get_db),
):
    """
    Calcula la clasificación completa para una edición de competición.
    Incluye todos los equipos que hayan jugado al menos un partido.
    Criterios de desempate RFEF (Art. 11):
        1. Mayor diferencia de goles en enfrentamientos directos
        2. Mayor diferencia de goles general
        3. Mayor número de goles a favor general
    """
    partidos = (
        db.query(Partido)
        .options(
            joinedload(Partido.equipo_local_rel),
            joinedload(Partido.equipo_visitante_rel),
        )
        .filter(
            Partido.competicion_temporada == competicion_temporada_id,
            Partido.estado == EstadoPartido.jugado,
        )
        .all()
    )

    tabla: dict[int, dict] = {}

    def init_equipo(equipo_id: int, nombre: str, abreviacion: str, nombre_corto: str):
        if equipo_id not in tabla:
            tabla[equipo_id] = {
                "equipo_id": equipo_id,
                "equipo_nombre": nombre,
                "abreviacion": abreviacion,
                "nombre_corto": nombre_corto,
                "pj": 0, "pg": 0, "pe": 0, "pp": 0,
                "gf": 0, "gc": 0,
            }

    for p in partidos:
        init_equipo(
            p.equipo_local,
            p.equipo_local_rel.nombre,
            p.equipo_local_rel.abreviacion,
            p.equipo_local_rel.nombre_corto,
        )
        init_equipo(
            p.equipo_visitante,
            p.equipo_visitante_rel.nombre,
            p.equipo_visitante_rel.abreviacion,
            p.equipo_visitante_rel.nombre_corto,
        )

        gl = p.goles_local if p.goles_local is not None else 0
        gv = p.goles_visitante if p.goles_visitante is not None else 0

        tabla[p.equipo_local]["pj"]     += 1
        tabla[p.equipo_local]["gf"]     += gl
        tabla[p.equipo_local]["gc"]     += gv
        tabla[p.equipo_visitante]["pj"] += 1
        tabla[p.equipo_visitante]["gf"] += gv
        tabla[p.equipo_visitante]["gc"] += gl

        if gl > gv:
            tabla[p.equipo_local]["pg"]     += 1
            tabla[p.equipo_visitante]["pp"] += 1
        elif gl < gv:
            tabla[p.equipo_visitante]["pg"] += 1
            tabla[p.equipo_local]["pp"]     += 1
        else:
            tabla[p.equipo_local]["pe"]     += 1
            tabla[p.equipo_visitante]["pe"] += 1

    result = []
    for datos in tabla.values():
        pts = datos["pg"] * 3 + datos["pe"]
        dg  = datos["gf"] - datos["gc"]
        result.append(ClasificacionEquipo(**datos, dg=dg, pts=pts))

    # ── Desempate RFEF ────────────────────────────────────────────────────────

    def dg_enfrentamiento_directo(id_a: int, id_b: int) -> tuple[int, int]:
        """Diferencia de goles entre id_a e id_b en sus enfrentamientos."""
        dg_a, dg_b = 0, 0
        for p in partidos:
            es_ab = p.equipo_local == id_a and p.equipo_visitante == id_b
            es_ba = p.equipo_local == id_b and p.equipo_visitante == id_a
            if not (es_ab or es_ba):
                continue
            gl = p.goles_local if p.goles_local is not None else 0
            gv = p.goles_visitante if p.goles_visitante is not None else 0
            if es_ab:
                dg_a += gl - gv
                dg_b += gv - gl
            else:
                dg_b += gl - gv
                dg_a += gv - gl
        return dg_a, dg_b

    def comparar(a: ClasificacionEquipo, b: ClasificacionEquipo) -> int:
        # 1. Puntos generales
        if a.pts != b.pts:
            return a.pts - b.pts
        # 2. Diferencia de goles en enfrentamiento(s) directo(s)
        dg_a, dg_b = dg_enfrentamiento_directo(a.equipo_id, b.equipo_id)
        if dg_a != dg_b:
            return dg_a - dg_b
        # 3. Diferencia de goles general
        if a.dg != b.dg:
            return a.dg - b.dg
        # 4. Goles a favor general
        return a.gf - b.gf
        # 5. Juego limpio y 6. partido en campo neutral: no resolubles en código

    result.sort(key=functools.cmp_to_key(comparar), reverse=True)
    return result

# ── Estadísticas por jugador ──────────────────────────────────────────────────

@router.get("/jugadores", response_model=list[EstadisticaJugador])
def get_estadisticas_jugadores(
    temporada_id: Optional[int] = Query(None),
    competicion_temporada_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Goles, asistencias, tarjetas y partidos jugados por jugador.
    Filtra opcionalmente por temporada o edición de competición.
    """
    # Base de partidos según filtros
    partidos_query = db.query(Partido.id).filter(Partido.estado == EstadoPartido.jugado)
    if competicion_temporada_id:
        partidos_query = partidos_query.filter(Partido.competicion_temporada == competicion_temporada_id)
    elif temporada_id:
        ct_ids = db.query(CompeticionTemporada.id).filter(CompeticionTemporada.temporada == temporada_id)
        partidos_query = partidos_query.filter(Partido.competicion_temporada.in_(ct_ids))
    partido_ids = [r[0] for r in partidos_query.all()]

    if not partido_ids:
        return []

    # Goles por jugador
    goles_q = (
        db.query(GolPartido.anotador, func.count().label("goles"))
        .filter(GolPartido.partido.in_(partido_ids), GolPartido.a_favor == True)
        .group_by(GolPartido.anotador)
        .all()
    )
    goles_map = {r.anotador: r.goles for r in goles_q}

    # Penaltis por jugador
    penaltis_q = (
        db.query(GolPartido.anotador, func.count().label("penaltis"))
        .filter(GolPartido.partido.in_(partido_ids), GolPartido.a_favor == True, GolPartido.tipo == "penalti")
        .group_by(GolPartido.anotador)
        .all()
    )
    penaltis_map = {r.anotador: r.penaltis for r in penaltis_q}

    # Asistencias por jugador
    asist_q = (
        db.query(GolPartido.asistente, func.count().label("asistencias"))
        .filter(GolPartido.partido.in_(partido_ids), GolPartido.asistente.isnot(None))
        .group_by(GolPartido.asistente)
        .all()
    )
    asist_map = {r.asistente: r.asistencias for r in asist_q}

    # Tarjetas por jugador
    tarjetas_q = (
        db.query(TarjetaPartido.jugador, TarjetaPartido.tipo, func.count().label("n"))
        .filter(TarjetaPartido.partido.in_(partido_ids))
        .group_by(TarjetaPartido.jugador, TarjetaPartido.tipo)
        .all()
    )
    amarillas_map: dict[int, int] = {}
    rojas_map: dict[int, int] = {}
    for r in tarjetas_q:
        if r.tipo in ("amarilla", "doble_amarilla"):
            amarillas_map[r.jugador] = amarillas_map.get(r.jugador, 0) + r.n
        else:
            rojas_map[r.jugador] = rojas_map.get(r.jugador, 0) + r.n

    # Partidos como titular
    titulares_q = (
        db.query(Alineacion.jugador, func.count().label("titulares"))
        .filter(
            Alineacion.partido.in_(partido_ids),
            Alineacion.titular == True,
        )
        .group_by(Alineacion.jugador)
        .all()
    )
    titulares_map = {r.jugador: r.titulares for r in titulares_q}

    # Partidos como suplente que entró (minuto_entrada no nulo)
    suplentes_q = (
        db.query(Alineacion.jugador, func.count().label("suplentes"))
        .filter(
            Alineacion.partido.in_(partido_ids),
            Alineacion.titular == False,
            Alineacion.minuto_entrada.isnot(None),
        )
        .group_by(Alineacion.jugador)
        .all()
    )
    suplentes_map = {r.jugador: r.suplentes for r in suplentes_q}

    # Jugadores involucrados
    jugador_ids = set(goles_map) | set(asist_map) | set(amarillas_map) | set(rojas_map) | set(titulares_map) | set(suplentes_map)
    jugadores = db.query(Jugador).filter(Jugador.id.in_(jugador_ids)).all()

    posiciones_q = (
        db.query(
            JugadorPosicion.jugador,
            Posicion.id,
            Posicion.nombre,
            Posicion.abreviacion,
            JugadorPosicion.es_posicion_principal
        )
        .join(Posicion, Posicion.id == JugadorPosicion.posicion)
        .filter(JugadorPosicion.jugador.in_(jugador_ids))
        .all()
    )

    posiciones_map: dict[int, list[PosicionJugadorOut]] = {}
    for r in posiciones_q:
        pos_out = PosicionJugadorOut(
            id=r.id,
            nombre=r.nombre,
            abreviacion=r.abreviacion,
            es_posicion_principal=r.es_posicion_principal
        )
        if r.jugador not in posiciones_map:
            posiciones_map[r.jugador] = []
        posiciones_map[r.jugador].append(pos_out)

    result = [
        EstadisticaJugador(
            jugador_id=j.id,
            nombre=j.nombre,
            nombre_conocido=j.nombre_conocido,
            apellidos=j.apellidos,
            ruta_foto=j.ruta_foto,
            goles=goles_map.get(j.id, 0),
            goles_penalti=penaltis_map.get(j.id, 0),
            asistencias=asist_map.get(j.id, 0),
            tarjetas_amarillas=amarillas_map.get(j.id, 0),
            tarjetas_rojas=rojas_map.get(j.id, 0),
            partidos_jugados=titulares_map.get(j.id, 0) + suplentes_map.get(j.id, 0),
            partidos_titular=titulares_map.get(j.id, 0),
            partidos_suplente=suplentes_map.get(j.id, 0),
            posiciones=posiciones_map.get(j.id, []),
        )
        for j in jugadores
    ]
    result.sort(key=lambda x: x.goles, reverse=True)
    return result

# ── Estadísticas generales del equipo principal ──────────────────────────────────────────────────

@router.get("/generales")
def obtener_estadisticas_generales_equipo_principal(db: Session = Depends(get_db)):
    # 1. Identificar el equipo principal asignado
    equipo_principal = db.query(Equipo).filter(Equipo.equipo_principal == True).first()
    if not equipo_principal:
        raise HTTPException(
            status_code=404, 
            detail="No se ha configurado ningún equipo como 'equipo_principal'."
        )
    
    eq_id = equipo_principal.id

    # 2. Construir las condiciones lógicas de victoria, empate y derrota
    # Caso A: El equipo principal juega en casa
    victoria_local = and_(Partido.equipo_local == eq_id, or_(
        Partido.goles_local > Partido.goles_visitante,
        and_(Partido.goles_local == Partido.goles_visitante, Partido.penaltis_local > Partido.penaltis_visitantes)
    ))
    
    derrota_local = and_(Partido.equipo_local == eq_id, or_(
        Partido.goles_local < Partido.goles_visitante,
        and_(Partido.goles_local == Partido.goles_visitante, Partido.penaltis_local < Partido.penaltis_visitantes)
    ))

    # Caso B: El equipo principal juega fuera
    victoria_visitante = and_(Partido.equipo_visitante == eq_id, or_(
        Partido.goles_visitante > Partido.goles_local,
        and_(Partido.goles_local == Partido.goles_visitante, Partido.penaltis_visitantes > Partido.penaltis_local)
    ))
    
    derrota_visitante = and_(Partido.equipo_visitante == eq_id, or_(
        Partido.goles_visitante < Partido.goles_local,
        and_(Partido.goles_local == Partido.goles_visitante, Partido.penaltis_visitantes < Partido.penaltis_local)
    ))

    # El empate puro se da cuando los goles son iguales y no existió definición por penaltis
    empate = or_(
        and_(Partido.equipo_local == eq_id, Partido.goles_local == Partido.goles_visitante, Partido.penaltis_local.is_(None)),
        and_(Partido.equipo_visitante == eq_id, Partido.goles_local == Partido.goles_visitante, Partido.penaltis_visitantes.is_(None))
    )

    # 3. Ejecutar una única consulta agregada (Agregación condicional con CASE)
    stats = (
        db.query(
            func.count(Partido.id).label("jugados"),
            func.sum(case((or_(victoria_local, victoria_visitante), 1), else_=0)).label("ganados"),
            func.sum(case((empate, 1), else_=0)).label("empatados"),
            func.sum(case((or_(derrota_local, derrota_visitante), 1), else_=0)).label("perdidos")
        )
        .filter(
            Partido.estado == EstadoPartido.jugado,
            or_(Partido.equipo_local == eq_id, Partido.equipo_visitante == eq_id)
        )
        .first()
    )

    total_titulos = (
        db.query(func.count(Trofeo.id)).scalar() or 0
    )

    total_ascensos = (
        db.query(func.count(CompeticionTemporada.id))
        .filter(CompeticionTemporada.ascenso == True)
        .scalar() or 0
    )

    # 4. Formatear la respuesta mapeando valores nulos a 0 (por si no hay partidos disputados aún)
    return {
        "equipo": equipo_principal.nombre,
        "partidos_jugados": stats.jugados or 0,
        "partidos_ganados": int(stats.ganados or 0),
        "partidos_empatados": int(stats.empatados or 0),
        "partidos_perdidos": int(stats.perdidos or 0),
        "total_titulos": total_titulos,
        "total_ascensos": total_ascensos
    }