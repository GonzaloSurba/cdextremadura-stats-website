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
from app.models.models import Trofeo
from app.core.deps import get_current_user_id

from .competiciones import CompeticionTemporadaOut

router = APIRouter()

class TrofeoCreate(BaseModel):
    competicion_temporada: int

class TrofeoOut(TrofeoCreate):
    id: int
    competicion_temporada_rel: Optional[CompeticionTemporadaOut]

    class Config:
        from_attributes = True

@router.get("/", response_model=list[TrofeoOut])
def list_trofeos(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Trofeo).offset(skip).limit(limit).all()

@router.post("/", response_model=TrofeoOut, status_code=status.HTTP_201_CREATED)
def create_trofeo(data: TrofeoCreate, db: Session = Depends(get_db), _: str = Depends(get_current_user_id)):
    trofeo = Trofeo(**data.model_dump())
    db.add(trofeo)
    db.commit()
    db.refresh(trofeo)
    return trofeo

@router.delete("/{trofeo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trofeo(trofeo_id: int, db: Session = Depends(get_db), _: str = Depends(get_current_user_id)):
    trofeo = db.get(Trofeo, trofeo_id)
    if not trofeo:
        raise HTTPException(status_code=404, detail="Trofeo no encontrado")
    db.delete(trofeo)
    db.commit()