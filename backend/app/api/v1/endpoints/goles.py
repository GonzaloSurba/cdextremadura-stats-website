# ExtremaduraStats
# Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.db.session import get_db
from app.models.models import GolPartido, TipoGol
from app.core.deps import get_current_user_id

from .jugadores import JugadorSimpleOut

router = APIRouter()

class GolCreate(BaseModel):
    partido: int
    anotador: int
    minuto: int
    tipo: TipoGol = TipoGol.normal
    asistente: Optional[int] = None
    a_favor: bool = True
    numero_gol: Optional[int] = None

class GolOut(GolCreate):
    id: int
    anotador_rel: JugadorSimpleOut
    asistente_rel: Optional[JugadorSimpleOut]

    class Config:
        from_attributes = True

@router.post("/", response_model=GolOut, status_code=status.HTTP_201_CREATED)
def create_gol(data: GolCreate, db: Session = Depends(get_db), _: str = Depends(get_current_user_id)):
    gol = GolPartido(**data.model_dump())
    db.add(gol)
    db.commit()
    db.refresh(gol)
    return gol

@router.delete("/{gol_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gol(gol_id: int, db: Session = Depends(get_db), _: str = Depends(get_current_user_id)):
    gol = db.get(GolPartido, gol_id)
    if not gol:
        raise HTTPException(status_code=404, detail="Gol no encontrado")
    db.delete(gol)
    db.commit()