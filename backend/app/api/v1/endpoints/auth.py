# ExtremaduraStats
# Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
"""
Endpoint de autenticación.
Para simplificar, el usuario admin se define en variables de entorno
ya que mi web no contiene usuarios como tal.
"""

import os
from fastapi import APIRouter, HTTPException, status, Request
from pydantic import BaseModel

from app.core.security import create_access_token, verify_password, hash_password
from app.core.config import settings
from app.core.limiter import limiter

router = APIRouter()

# Usuario hardcodeado para el panel de admin.
ADMIN_USERNAME = settings.ADMIN_USERNAME
ADMIN_PASSWORD_HASH = settings.ADMIN_PASSWORD_HASH

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, data: LoginRequest):
    if data.username != ADMIN_USERNAME or not verify_password(data.password, ADMIN_PASSWORD_HASH):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )
    token = create_access_token(subject=data.username)
    return TokenResponse(access_token=token)