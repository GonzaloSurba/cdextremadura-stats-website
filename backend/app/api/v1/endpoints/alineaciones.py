# ExtremaduraStats
# Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
"""
Alineaciones.
POST  /                       → crear (protegido)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.db.session import get_db
from app.models.models import Alineacion
from app.core.deps import get_current_user_id

from .jugadores import JugadorSimpleOut

router = APIRouter()

class AlineacionCreate(BaseModel):
    jugador: int
    partido: int
    titular: bool
    minuto_entrada: Optional[int] = None
    minuto_salida: Optional[int] = None

class AlineacionOut(AlineacionCreate):
    id: int
    jugador_rel: JugadorSimpleOut
    dorsal: Optional[int] = None
    
    class Config:
        from_attributes = True

class AlineacionUpdate(BaseModel):
    minuto_salida: Optional[int] = None

@router.post('/', response_model=AlineacionOut, status_code=status.HTTP_201_CREATED)
def create_alineacion(data: AlineacionCreate, db: Session = Depends(get_db), _: str = Depends(get_current_user_id)):
    alineacion = Alineacion(**data.model_dump())
    db.add(alineacion)
    db.commit()
    db.refresh(alineacion)
    return alineacion

@router.patch("/por-jugador", response_model=AlineacionOut)
def update_alineacion_por_jugador(
    jugador: int,
    partido: int,
    data: AlineacionUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_user_id),
):
    alineacion = db.query(Alineacion).filter(
        Alineacion.jugador == jugador,
        Alineacion.partido == partido,
        Alineacion.titular == True,
    ).first()
    if not alineacion:
        raise HTTPException(status_code=404, detail="Alineación no encontrada")
    
    alineacion.minuto_salida = data.minuto_salida
    db.commit()
    db.refresh(alineacion)
    return alineacion