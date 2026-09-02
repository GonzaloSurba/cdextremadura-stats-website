# ExtremaduraStats
# Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
"""
Este archivo implementa la seguridad JWT y hashing de contraseñas.
Cómo funciona:
1. Usuario hace login → se hashea password con bcrypt
2. API emite token JWT con sub (user id) + expiración
3. Cliente envía token en header `Authorization: Bearer
"""

from datetime import datetime, timedelta, UTC
from typing import Any

from jose import jwt
import bcrypt

from app.core.config import settings


def hash_password(password: str) -> str:
    """
    Hashea contraseñas con bcrypt
    """
    # Convertimos la contraseña a bytes
    pwd_bytes = password.encode('utf-8')
    # Generamos el salt y el hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    # Devolvemos como string para que sea compatible con tu base de datos/env
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica contraseña plana contra el hash almacenado.
    """
    try:
        return bcrypt.checkpw(
            password=plain_password.encode('utf-8'),
            hashed_password=hashed_password.encode('utf-8')
        )
    except Exception:
        return False


def create_access_token(subject: Any) -> str:
    """
    Genera token JWT con expiración
    """
    expire = datetime.now(UTC) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(subject), "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> str | None:
    """
    Decodifica y valida token JWT
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("sub")
    except Exception:
        return None