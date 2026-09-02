# ExtremaduraStats
# Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
"""
Entrenadores — CRUD completo + endpoints histórico y detalle.

GET  /entrenadores              → lista (público)
GET  /entrenadores/historico    → lista con agregados (público)
GET  /entrenadores/detalles/{id} → detalle con stats por temporada (público)
GET  /entrenadores/{id}         → detalle básico (público)
POST /entrenadores              → crear (protegido)
PUT  /entrenadores/{id}         → actualizar (protegido)
DELETE /entrenadores/{id}       → eliminar (protegido)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from pydantic import BaseModel
from datetime import date
from typing import Optional

from app.db.session import get_db
from app.models.models import Entrenador, Partido, EstadoPartido, EntrenadorTemporada, CompeticionTemporada, Temporada
from app.core.deps import get_current_user_id

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class EntrenadorBase(BaseModel):
    nombre: str
    apellidos: str
    nombre_conocido: Optional[str] = None
    nacionalidad: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    ruta_foto: Optional[str] = None
    localidad_nacimiento: Optional[str] = None

class EntrenadorCreate(EntrenadorBase):
    pass

class EntrenadorUpdate(EntrenadorBase):
    nombre: Optional[str] = None
    apellidos: Optional[str] = None

class EntrenadorOut(EntrenadorBase):
    id: int

    class Config:
        from_attributes = True

class EntrenadorHistoricoOut(EntrenadorOut):
    total_partidos: int
    total_victorias: int
    total_derrotas: int
    total_empates: int
    total_temporadas: int

class TemporadaEntrenadorOut(BaseModel):
    temporada_id: int
    temporada_nombre: str
    partidos: int
    victorias: int
    empates: int
    derrotas: int

class EntrenadorDetalleOut(EntrenadorOut):
    total_partidos: int
    total_victorias: int
    total_derrotas: int
    total_empates: int
    total_temporadas: int
    temporadas: list[TemporadaEntrenadorOut]

# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/", response_model=list[EntrenadorOut])
def list_entrenadores(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    return db.query(Entrenador).offset(skip).limit(limit).all()


@router.get("/historico", response_model=list[EntrenadorHistoricoOut])
def list_historico_entrenadores(db: Session = Depends(get_db)):

    subq_partidos = (
        db.query(func.count(Partido.id))
        .filter(
            Partido.estado == EstadoPartido.jugado,
            or_(
                Partido.entrenador_local == Entrenador.id,
                Partido.entrenador_visitante == Entrenador.id,
            ),
        )
        .scalar_subquery()
    )

    subq_victorias = (
        db.query(func.count(Partido.id))
        .filter(
            Partido.estado == EstadoPartido.jugado,
            or_(
                and_(
                    Partido.entrenador_local == Entrenador.id,
                    Partido.goles_local > Partido.goles_visitante,
                ),
                and_(
                    Partido.entrenador_visitante == Entrenador.id,
                    Partido.goles_visitante > Partido.goles_local,
                ),
            ),
        )
        .scalar_subquery()
    )

    subq_derrotas = (
        db.query(func.count(Partido.id))
        .filter(
            Partido.estado == EstadoPartido.jugado,
            or_(
                and_(
                    Partido.entrenador_local == Entrenador.id,
                    Partido.goles_local < Partido.goles_visitante,
                ),
                and_(
                    Partido.entrenador_visitante == Entrenador.id,
                    Partido.goles_visitante < Partido.goles_local,
                ),
            ),
        )
        .scalar_subquery()
    )

    subq_empates = (
        db.query(func.count(Partido.id))
        .filter(
            Partido.estado == EstadoPartido.jugado,
            Partido.goles_local == Partido.goles_visitante,
            or_(
                Partido.entrenador_local == Entrenador.id,
                Partido.entrenador_visitante == Entrenador.id,
            ),
        )
        .scalar_subquery()
    )

    subq_temporadas = (
        db.query(func.count(func.distinct(EntrenadorTemporada.temporada)))
        .filter(EntrenadorTemporada.entrenador == Entrenador.id)
        .scalar_subquery()
    )

    resultados = (
        db.query(
            Entrenador,
            func.coalesce(subq_partidos, 0).label("total_partidos"),
            func.coalesce(subq_victorias, 0).label("total_victorias"),
            func.coalesce(subq_derrotas, 0).label("total_derrotas"),
            func.coalesce(subq_empates, 0).label("total_empates"),
            func.coalesce(subq_temporadas, 0).label("total_temporadas"),
        )
        .filter(
            db.query(EntrenadorTemporada)
            .filter(EntrenadorTemporada.entrenador == Entrenador.id)
            .exists()
        )
        .all()
    )

    return [
        EntrenadorHistoricoOut(
            id=e.id,
            nombre=e.nombre,
            apellidos=e.apellidos,
            nombre_conocido=e.nombre_conocido,
            nacionalidad=e.nacionalidad,
            fecha_nacimiento=e.fecha_nacimiento,
            ruta_foto=e.ruta_foto,
            localidad_nacimiento=e.localidad_nacimiento,
            total_partidos=int(p),
            total_victorias=int(v),
            total_derrotas=int(d),
            total_empates=int(em),
            total_temporadas=int(t),
        )
        for e, p, v, d, em, t in resultados
    ]


@router.get("/detalles/{entrenador_id}", response_model=EntrenadorDetalleOut)
def get_entrenador_detalles(entrenador_id: int, db: Session = Depends(get_db)):
    entrenador = db.get(Entrenador, entrenador_id)
    if not entrenador:
        raise HTTPException(status_code=404, detail="Entrenador no encontrado")

    et_rows = (
        db.query(EntrenadorTemporada, Temporada)
        .join(Temporada, Temporada.id == EntrenadorTemporada.temporada)
        .filter(EntrenadorTemporada.entrenador == entrenador_id)
        .all()
    )

    total_partidos = 0
    total_victorias = 0
    total_empates = 0
    total_derrotas = 0
    temporadas_out = []

    for _, temp in et_rows:
        partidos = (
            db.query(Partido)
            .join(CompeticionTemporada, Partido.competicion_temporada == CompeticionTemporada.id)
            .filter(
                Partido.estado == EstadoPartido.jugado,
                CompeticionTemporada.temporada == temp.id,
                or_(
                    Partido.entrenador_local == entrenador_id,
                    Partido.entrenador_visitante == entrenador_id,
                ),
            )
            .all()
        )

        pj = len(partidos)
        wins = sum(
            1 for p in partidos
            if (p.entrenador_local == entrenador_id and p.goles_local > p.goles_visitante)
            or (p.entrenador_visitante == entrenador_id and p.goles_visitante > p.goles_local)
        )
        draws = sum(
            1 for p in partidos
            if p.goles_local == p.goles_visitante
        )
        losses = pj - wins - draws

        temporadas_out.append(TemporadaEntrenadorOut(
            temporada_id=temp.id,
            temporada_nombre=temp.nombre,
            partidos=pj,
            victorias=wins,
            empates=draws,
            derrotas=losses,
        ))

        total_partidos += pj
        total_victorias += wins
        total_empates += draws
        total_derrotas += losses

    return EntrenadorDetalleOut(
        id=entrenador.id,
        nombre=entrenador.nombre,
        apellidos=entrenador.apellidos,
        nombre_conocido=entrenador.nombre_conocido,
        nacionalidad=entrenador.nacionalidad,
        fecha_nacimiento=entrenador.fecha_nacimiento,
        ruta_foto=entrenador.ruta_foto,
        localidad_nacimiento=entrenador.localidad_nacimiento,
        total_partidos=total_partidos,
        total_victorias=total_victorias,
        total_derrotas=total_derrotas,
        total_empates=total_empates,
        total_temporadas=len(temporadas_out),
        temporadas=temporadas_out,
    )


@router.get("/{entrenador_id}", response_model=EntrenadorOut)
def get_entrenador(entrenador_id: int, db: Session = Depends(get_db)):
    entrenador = db.get(Entrenador, entrenador_id)
    if not entrenador:
        raise HTTPException(status_code=404, detail="Entrenador no encontrado")
    return entrenador


@router.post("/", response_model=EntrenadorOut, status_code=status.HTTP_201_CREATED)
def create_entrenador(
    data: EntrenadorCreate,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_user_id),   # protegido
):
    entrenador = Entrenador(**data.model_dump())
    db.add(entrenador)
    db.commit()
    db.refresh(entrenador)
    return entrenador


@router.put("/{entrenador_id}", response_model=EntrenadorOut)
def update_entrenador(
    entrenador_id: int,
    data: EntrenadorUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_user_id),   # protegido
):
    entrenador = db.get(Entrenador, entrenador_id)
    if not entrenador:
        raise HTTPException(status_code=404, detail="Entrenador no encontrado")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(entrenador, field, value)
    db.commit()
    db.refresh(entrenador)
    return entrenador


@router.delete("/{entrenador_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entrenador(
    entrenador_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_user_id),   # protegido
):
    entrenador = db.get(Entrenador, entrenador_id)
    if not entrenador:
        raise HTTPException(status_code=404, detail="Entrenador no encontrado")
    db.delete(entrenador)
    db.commit()