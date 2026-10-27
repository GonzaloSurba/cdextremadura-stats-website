# ExtremaduraStats
# Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
"""
Equipos — CRUD completo.
GET  /equipos          → lista (público)
GET  /equipos/{id}     → detalle (público)
POST /equipos          → crear (protegido)
PUT  /equipos/{id}     → actualizar (protegido)
DELETE /equipos/{id}   → eliminar (protegido)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import get_current_user_id
from app.db.session import get_db
from app.models.models import Equipo

router = APIRouter()

# ── Schemas ───────────────────────────────────────────────────────────────────

class EquipoBase(BaseModel):
    nombre: str
    abreviacion: str | None = None
    nombre_corto: str | None = None
    ruta_escudo: str | None = None
    localidad: str | None = None
    pais: str | None = None
    equipo_principal: bool = False
    estadio: str | None = None

class EquipoCreate(EquipoBase):
    pass

class EquipoUpdate(EquipoBase):
    nombre: str | None = None

class EquipoOut(EquipoBase):
    id: int
    class Config:
        from_attributes = True

# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/", response_model=list[EquipoOut])
def list_equipos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Equipo).offset(skip).limit(limit).all()

@router.get("/{equipo_id}", response_model=EquipoOut)
def get_equipo(equipo_id: int, db: Session = Depends(get_db)):
    equipo = db.get(Equipo, equipo_id)
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    return equipo

@router.post("/", response_model=EquipoOut, status_code=status.HTTP_201_CREATED)
def create_equipo(data: EquipoCreate, db: Session = Depends(get_db), _: str = Depends(get_current_user_id)):
    equipo = Equipo(**data.model_dump())
    db.add(equipo)
    db.commit()
    db.refresh(equipo)
    return equipo

@router.put("/{equipo_id}", response_model=EquipoOut)
def update_equipo(equipo_id: int, data: EquipoUpdate, db: Session = Depends(get_db), _: str = Depends(get_current_user_id)):
    equipo = db.get(Equipo, equipo_id)
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(equipo, field, value)
    db.commit()
    db.refresh(equipo)
    return equipo

@router.delete("/{equipo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_equipo(equipo_id: int, db: Session = Depends(get_db), _: str = Depends(get_current_user_id)):
    equipo = db.get(Equipo, equipo_id)
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    db.delete(equipo)
    db.commit()
