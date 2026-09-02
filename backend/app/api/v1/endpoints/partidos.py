# ExtremaduraStats
# Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
"""
Partidos — CRUD completo.
GET  /partidos                       → lista (público)
GET  /partidos/{id}                  → detalle (público)
POST /partidos                       → crear (protegido)
PUT  /partidos/{id}                  → actualizar (protegido)
DELETE /partidos/{id}                → eliminar (protegido)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import extract, or_
from pydantic import BaseModel, computed_field
from datetime import datetime
from typing import Optional

from app.db.session import get_db
from app.models.models import Partido, EstadoPartido, Alineacion, GolPartido, TarjetaPartido, Entrenador, CompeticionTemporada, PenaltiTanda, Equipo, JugadorTemporada
from app.core.deps import get_current_user_id

from .alineaciones import AlineacionOut
from .goles import GolOut
from .tarjetas import TarjetaOut
from .entrenadores import EntrenadorOut
from .competiciones import CompeticionTemporadaOut
from .equipos import EquipoOut
from .penaltis import PenaltiOut

router = APIRouter()

class PartidoBase(BaseModel):
    equipo_local: int
    equipo_visitante: int
    goles_local: int = 0
    goles_visitante: int = 0
    fecha: datetime
    competicion_temporada: int
    jornada: Optional[int] = None
    estadio: Optional[str] = None
    estado: EstadoPartido = EstadoPartido.programado
    prorroga: bool = False
    entrenador_local: Optional[int] = None
    entrenador_visitante: Optional[int] = None
    penaltis_local: Optional[int] = None
    penaltis_visitantes: Optional[int] = None

class PartidoCreate(PartidoBase):
    pass

class PartidoUpdate(PartidoBase):
    equipo_local: Optional[int] = None
    equipo_visitante: Optional[int] = None
    fecha: Optional[datetime] = None
    competicion_temporada: Optional[int] = None

class PartidoOut(PartidoBase):
    id: int
    alineaciones: list[AlineacionOut] = []
    goles: list[GolOut] = []
    tarjetas: list[TarjetaOut] = []
    equipo_local_rel: Optional[EquipoOut] = None
    equipo_visitante_rel: Optional[EquipoOut] = None
    entrenador_local_rel: Optional[EntrenadorOut] = None
    entrenador_visitante_rel: Optional[EntrenadorOut] = None
    competicion_temporada_rel: Optional[CompeticionTemporadaOut] = None
    tanda_penaltis: list[PenaltiOut] = []
    
    @computed_field
    @property
    def competicion(self) -> Optional[str]:
        rel = self.competicion_temporada_rel
        if rel and rel.competicion_rel:
            return rel.competicion_rel.nombre
        return None

    class Config:
        from_attributes = True

@router.get("/", response_model=list[PartidoOut])
def list_partidos(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Partido).offset(skip).limit(limit).all()

@router.get("/{partido_id}", response_model=PartidoOut)
def get_partido(partido_id: int, db: Session = Depends(get_db)):
    #partido = db.get(Partido, partido_id)
    partido = db.query(Partido)\
        .options(
            joinedload(Partido.alineaciones).joinedload(Alineacion.jugador_rel),
            joinedload(Partido.goles).joinedload(GolPartido.anotador_rel),
            joinedload(Partido.goles).joinedload(GolPartido.asistente_rel),
            joinedload(Partido.tarjetas).joinedload(TarjetaPartido.jugador_rel),
            joinedload(Partido.equipo_local_rel),
            joinedload(Partido.equipo_visitante_rel),
            joinedload(Partido.entrenador_local_rel),
            joinedload(Partido.entrenador_visitante_rel),
            joinedload(Partido.competicion_temporada_rel).joinedload(CompeticionTemporada.competicion_rel),
            joinedload(Partido.tanda_penaltis).joinedload(PenaltiTanda.jugador_rel),
        )\
        .filter(Partido.id == partido_id)\
        .first()
    
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado")

    temporada_id = partido.competicion_temporada_rel.temporada
    dorsales = {
        jt.jugador: jt.dorsal
        for jt in db.query(JugadorTemporada)
                .filter(JugadorTemporada.temporada == temporada_id)
                .all()
    }
    partido_data = PartidoOut.model_validate(partido)
    for a in partido_data.alineaciones:
        a.dorsal = dorsales.get(a.jugador)
    
    return partido_data

@router.get("/temporada/{competicion_temporada_id}", response_model=list[PartidoOut])
def get_partidos_temporada(competicion_temporada_id: int, db: Session = Depends(get_db)):
    partidos = db.query(Partido).filter(Partido.competicion_temporada == competicion_temporada_id)
    if not partidos:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
    return partidos

@router.get("/efemerides/hoy", response_model=list[PartidoOut])
def obtener_partidos_hoy_historicos(db: Session = Depends(get_db)):
    """
    Devuelve todos los partidos jugados un día como hoy (mismo día y mes)
    en los que haya participado el equipo principal a lo largo de la historia.
    """
    hoy = datetime.now()
    dia_actual = hoy.day
    mes_actual = hoy.month

    # 1. Obtenemos el ID del equipo principal (por ejemplo, Extremadura)
    equipo_principal = db.query(Equipo).filter(Equipo.equipo_principal == True).first()
    
    if not equipo_principal:
        raise HTTPException(
            status_code=404, 
            detail="No se ha configurado ningún equipo como 'equipo_principal' en la base de datos."
        )

    # 2. Buscamos los partidos filtrando por día, mes y participación del equipo
    partidos = (
        db.query(Partido)
        # Cargamos las relaciones necesarias para el frontend de golpe (evita N+1 queries)
        .options(
            joinedload(Partido.equipo_local_rel),
            joinedload(Partido.equipo_visitante_rel),
            joinedload(Partido.competicion_temporada_rel)
        )
        .filter(
            # Filtrado de efemérides (mismo día y mes prescindiendo del año)
            extract('day', Partido.fecha) == dia_actual,
            extract('month', Partido.fecha) == mes_actual,
            # El equipo principal debe ser el local O el visitante
            or_(
                Partido.equipo_local == equipo_principal.id,
                Partido.equipo_visitante == equipo_principal.id
            )
        )
        # Opcional: Ordenamos del más reciente al más antiguo
        .order_by(Partido.fecha.desc())
        .all()
    )

    return partidos

@router.post("/", response_model=PartidoOut, status_code=status.HTTP_201_CREATED)
def create_partido(data: PartidoCreate, db: Session = Depends(get_db), _: str = Depends(get_current_user_id)):
    partido = Partido(**data.model_dump())
    db.add(partido)
    db.commit()
    db.refresh(partido)
    return partido

@router.put("/{partido_id}", response_model=PartidoOut)
def update_partido(partido_id: int, data: PartidoUpdate, db: Session = Depends(get_db), _: str = Depends(get_current_user_id)):
    partido = db.get(Partido, partido_id)
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(partido, field, value)
    db.commit()
    db.refresh(partido)
    return partido

@router.delete("/{partido_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_partido(partido_id: int, db: Session = Depends(get_db), _: str = Depends(get_current_user_id)):
    partido = db.get(Partido, partido_id)
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
    db.delete(partido)
    db.commit()
