# ExtremaduraStats
# Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
"""
Competiciones — CRUD completo.
GET  /competiciones          → lista (público)
GET  /competiciones/{id}     → detalle (público)
POST /competiciones          → crear (protegido)
PUT  /competiciones/{id}     → actualizar (protegido)
DELETE /competiciones/{id}   → eliminar (protegido)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, computed_field
from typing import Optional

from app.db.session import get_db
from app.models.models import Competicion, TipoCompeticion, Temporada, CompeticionTemporada
from app.core.deps import get_current_user_id

from .temporadas import TemporadaOut

router = APIRouter()

class CompeticionBase(BaseModel):
    nombre: str
    pais: str
    tipo: TipoCompeticion
    oficial: bool = False

class CompeticionCreate(CompeticionBase):
    pass

class CompeticionUpdate(CompeticionBase):
    nombre: Optional[str] = None
    pais: Optional[str] = None
    tipo: Optional[TipoCompeticion] = None

class CompeticionOut(CompeticionBase):
    id: int
    class Config:
        from_attributes = True

class CompeticionTemporadaOut(BaseModel):
    id: int
    nombre: Optional[str] = None
    num_jornadas: Optional[int] = None
    num_equipos: Optional[int] = None
    grupo: Optional[int] = None
    ascenso: Optional[bool] = None
    descenso: Optional[bool] = None
    competicion_rel: Optional[CompeticionOut] = None
    temporada_rel: Optional[TemporadaOut] = None

    class Config:
        from_attributes = True

@router.get("/", response_model=list[CompeticionOut])
def list_competiciones(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Competicion).offset(skip).limit(limit).all()

@router.get("/temporadas", response_model=list[CompeticionTemporadaOut])
def list_competicion_temporada(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    resultados = (
        db.query(
            CompeticionTemporada,
            Competicion.nombre,
            Temporada.nombre,
        )
        .join(Competicion, CompeticionTemporada.competicion == Competicion.id)
        .join(Temporada, CompeticionTemporada.temporada == Temporada.id)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        CompeticionTemporadaOut(
            id=ct.id,
            nombre=f"{comp_nombre} {temp_nombre}",
            num_jornadas=ct.num_jornadas,
            num_equipos=ct.num_equipos,
            ascenso=ct.ascenso,
            descenso=ct.descenso,
            competicion_rel=ct.competicion_rel,
            temporada_rel=ct.temporada_rel
        )
        for ct, comp_nombre, temp_nombre in resultados
    ]

@router.get("/{competicion_id}", response_model=CompeticionOut)
def get_competicion(competicion_id: int, db: Session = Depends(get_db)):
    competicion = db.get(Competicion, competicion_id)
    if not competicion:
        raise HTTPException(status_code=404, detail="Competición no encontrada")
    return competicion

@router.post("/", response_model=CompeticionOut, status_code=status.HTTP_201_CREATED)
def create_competicion(data: CompeticionCreate, db: Session = Depends(get_db), _: str = Depends(get_current_user_id)):
    competicion = Competicion(**data.model_dump())
    db.add(competicion)
    db.commit()
    db.refresh(competicion)
    return competicion

@router.put("/{competicion_id}", response_model=CompeticionOut)
def update_competicion(competicion_id: int, data: CompeticionUpdate, db: Session = Depends(get_db), _: str = Depends(get_current_user_id)):
    competicion = db.get(Competicion, competicion_id)
    if not competicion:
        raise HTTPException(status_code=404, detail="Competición no encontrada")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(competicion, field, value)
    db.commit()
    db.refresh(competicion)
    return competicion

@router.delete("/{competicion_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_competicion(competicion_id: int, db: Session = Depends(get_db), _: str = Depends(get_current_user_id)):
    competicion = db.get(Competicion, competicion_id)
    if not competicion:
        raise HTTPException(status_code=404, detail="Competición no encontrada")
    db.delete(competicion)
    db.commit()
