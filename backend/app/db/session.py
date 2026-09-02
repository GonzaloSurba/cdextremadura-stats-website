# ExtremaduraStats
# Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
"""
Este archivo configura la conexión a la base de datos SQLAlchemy.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import settings

# engine - Crea el pool de conexiones MySQL.
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,      # detecta conexiones caídas
    pool_recycle=3600,       # recicla conexiones cada hora
    echo=False,              # pon True para ver las queries en desarrollo
)

"""
SessionLocal - Factory de sesiones:
- Crea sesiones DB para cada request
- autocommit=False / autoflush=False - control manual de transacciones
"""
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """
    Dependencia FastAPI:
    - Inyecta la sesión en cada endpoint automáticamente
    - yield db → proporciona la sesión
    - finally: db.close() → siempre cierra al terminar
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()