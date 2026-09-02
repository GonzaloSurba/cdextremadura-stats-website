# ExtremaduraStats
# Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
"""
Temporadas — CRUD completo.
GET  /temporadas          → lista (público)
GET  /temporadas/{id}     → detalle (público)
POST /temporadas          → crear (protegido)
PUT  /temporadas/{id}     → actualizar (protegido)
DELETE /temporadas/{id}   → eliminar (protegido)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
from typing import Optional

from app.db.session import get_db
from app.models.models import Temporada
from app.core.deps import get_current_user_id

router = APIRouter()

class TemporadaBase(BaseModel):
    nombre: str
    fecha_inicio: date
    fecha_fin: date

class TemporadaCreate(TemporadaBase):
    pass

class TemporadaUpdate(TemporadaBase):
    nombre: Optional[str] = None

class TemporadaOut(TemporadaBase):
    id: int
    class Config:
        from_attributes = True

@router.get("/", response_model=list[TemporadaOut])
def list_temporadas(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Temporada).offset(skip).limit(limit).all()

@router.get("/{temporada_id}", response_model=TemporadaOut)
def get_temporada(temporada_id: int, db: Session = Depends(get_db)):
    temporada = db.get(Temporada, temporada_id)
    if not temporada:
        raise HTTPException(status_code=404, detail="Temporada no encontrada")
    return temporada

@router.post("/", response_model=TemporadaOut, status_code=status.HTTP_201_CREATED)
def create_temporada(data: TemporadaCreate, db: Session = Depends(get_db), _: str = Depends(get_current_user_id)):
    temporada = Temporada(**data.model_dump())
    db.add(temporada)
    db.commit()
    db.refresh(temporada)
    return temporada

@router.put("/{temporada_id}", response_model=TemporadaOut)
def update_temporada(temporada_id: int, data: TemporadaUpdate, db: Session = Depends(get_db), _: str = Depends(get_current_user_id)):
    temporada = db.get(Temporada, temporada_id)
    if not temporada:
        raise HTTPException(status_code=404, detail="Temporada no encontrada")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(temporada, field, value)
    db.commit()
    db.refresh(temporada)
    return temporada

@router.delete("/{temporada_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_temporada(temporada_id: int, db: Session = Depends(get_db), _: str = Depends(get_current_user_id)):
    temporada = db.get(Temporada, temporada_id)
    if not temporada:
        raise HTTPException(status_code=404, detail="Temporada no encontrada")
    db.delete(temporada)
    db.commit()
