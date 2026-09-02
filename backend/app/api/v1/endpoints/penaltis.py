# ExtremaduraStats
# Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
"""
Penaltis de una tanda de penaltis. No debe usarse para penaltis durante el tiempo reglamentario del partido.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.db.session import get_db
from app.models.models import PenaltiTanda
from app.core.deps import get_current_user_id

from .jugadores import JugadorSimpleOut

router = APIRouter()

class PenaltiCreate(BaseModel):
    partido: int
    jugador: int
    a_favor: bool = True
    anotado: bool = True
    orden: int

class PenaltiOut(PenaltiCreate):
    id: int
    jugador_rel: Optional[JugadorSimpleOut]

    class Config:
        from_attributes = True

@router.post("/", response_model=PenaltiOut, status_code=status.HTTP_201_CREATED)
def create_penalti(data: PenaltiCreate, db: Session = Depends(get_db), _: str = Depends(get_current_user_id)):
    penalti = PenaltiTanda(**data.model_dump())
    db.add(penalti)
    db.commit()
    db.refresh(penalti)
    return penalti

@router.delete("/{penalti_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_penalti(penalti_id: int, db: Session = Depends(get_db), _: str = Depends(get_current_user_id)):
    penalti = db.get(PenaltiTanda, penalti_id)
    if not penalti:
        raise HTTPException(status_code=404, detail="Penalti no encontrado")
    db.delete(penalti)
    db.commit()