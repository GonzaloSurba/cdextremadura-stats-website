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
from app.db.session import get_db
from app.models.models import TarjetaPartido, TipoTarjeta
from app.core.deps import get_current_user_id

router = APIRouter()

class TarjetaCreate(BaseModel):
    partido: int
    jugador: int
    minuto: int
    tipo: TipoTarjeta

class TarjetaOut(TarjetaCreate):
    id: int
    class Config:
        from_attributes = True

@router.post("/", response_model=TarjetaOut, status_code=status.HTTP_201_CREATED)
def create_tarjeta(data: TarjetaCreate, db: Session = Depends(get_db), _: str = Depends(get_current_user_id)):
    tarjeta = TarjetaPartido(**data.model_dump())
    db.add(tarjeta)
    db.commit()
    db.refresh(tarjeta)
    return tarjeta

@router.delete("/{tarjeta_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tarjeta(tarjeta_id: int, db: Session = Depends(get_db), _: str = Depends(get_current_user_id)):
    tarjeta = db.get(TarjetaPartido, tarjeta_id)
    if not tarjeta:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    db.delete(tarjeta)
    db.commit()