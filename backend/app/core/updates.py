# ExtremaduraStats
# Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
"""
Este archivo verifica los campos que se envían a los endpoints con updates.
Evita que se intente guardar un campo como NULL cuando en la base de datos es NOT NULL,
así el error es controlado desde la API en vez de provocar el error en la base de datos.
"""

from fastapi import HTTPException, status
from pydantic import BaseModel
from sqlalchemy import inspect
from sqlalchemy.exc import NoInspectionAvailable
from sqlalchemy.orm import Mapper


def apply_updates(obj: object, data: BaseModel) -> None:
    """
    Esta función se encarga de validar los campos antes de intentar actualizar una fila
    de la base de datos.
    Primero comprueba que obj es un modelo de SQLAlchemy, luego valida todos los campos
    recibidos y si todos son válidos, los asigna.
    """
    try:
        mapper = inspect(type(obj))
    except NoInspectionAvailable as exc:
        raise RuntimeError(
            f"{type(obj).__name__} no es un modelo de SQLAlchemy"
        ) from exc

    if not isinstance(mapper, Mapper):
        raise RuntimeError(f"{type(obj).__name__} no es un modelo de SQLAlchemy")

    columns = mapper.columns
    changes = data.model_dump(exclude_unset=True)

    # Valido todos los campos
    for field, value in changes.items():
        if field not in columns:
            raise RuntimeError(f"'{field}' no es una columna de {type(obj).__name__}")
        col = columns[field]
        if col.primary_key:
            raise RuntimeError(f"'{field}' no se puede actualizar")
        if value is None and not col.nullable:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"El campo '{field}' no puede ser null",
            )

    # Asigno los campos
    for field, value in changes.items():
        setattr(obj, field, value)
