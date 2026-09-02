# ExtremaduraStats
# Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
"""
Este archivo define la configuración centralizada de la aplicación:
- PROJECT_NAME - Nombre del proyecto
- API_V1_STR - Prefijo de versión (/api/v1)
- Credenciales BD - Host, puerto, usuario, password, nombreBD
- JWT - Secret key, algoritmo, tiempo de expiración del token
- DATABASE_URL - Property que genera la URL de conexión completa
"""

from pydantic_settings import BaseSettings
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_DIR = BASE_DIR / '.env'

class Settings(BaseSettings):
    PROJECT_NAME: str = "CDExtremadura Stats API"
    API_V1_STR: str = "/api/v1"
    VERSION: str = "1.0"

    DB_HOST: str
    DB_PORT: int = 3306
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str

    DOMAIN: str = "localhost:8000"

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    ADMIN_USERNAME: str
    ADMIN_PASSWORD_HASH: str

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"
        )

    class Config:
        env_file = ENV_DIR


settings = Settings()