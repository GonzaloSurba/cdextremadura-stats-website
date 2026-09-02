# ExtremaduraStats
# Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
"""
Este archivo es el router principal de FastAPI. Configura todas las rutas de la aplicación:
Endpoints:
- /auth - Autenticación (pública)
- /jugadores - Gestión de jugadores
- /equipos - Gestión de equipos
- /temporadas - Temporadas
- /competiciones - Competiciones
- /partidos - Partidos
- /estadisticas - Estadísticas calculadas dinámicamente
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    jugadores,
    equipos,
    temporadas,
    competiciones,
    partidos,
    estadisticas,
    alineaciones,
    goles,
    tarjetas,
    entrenadores,
    penaltis,
    trofeos
)

api_router = APIRouter()

# Autenticación (pública)
api_router.include_router(auth.router,          prefix="/auth",          tags=["Auth"])

# Recursos principales (lectura pública, escritura protegida)
api_router.include_router(jugadores.router,     prefix="/jugadores",     tags=["Jugadores"])
api_router.include_router(equipos.router,       prefix="/equipos",       tags=["Equipos"])
api_router.include_router(temporadas.router,    prefix="/temporadas",    tags=["Temporadas"])
api_router.include_router(competiciones.router, prefix="/competiciones", tags=["Competiciones"])
api_router.include_router(partidos.router,      prefix="/partidos",      tags=["Partidos"])
api_router.include_router(alineaciones.router,  prefix="/alineaciones",  tags=["Alineaciones"])
api_router.include_router(goles.router,         prefix="/goles",         tags=["Goles"])
api_router.include_router(tarjetas.router,      prefix="/tarjetas",      tags=["Tarjetas"])
api_router.include_router(entrenadores.router,  prefix="/entrenadores",  tags=["Entrenadores"])
api_router.include_router(penaltis.router,      prefix="/penaltis",      tags=["Penaltis"])
api_router.include_router(trofeos.router,       prefix="/trofeos",       tags=["Trofeos"])

# Estadísticas calculadas dinámicamente
api_router.include_router(estadisticas.router,  prefix="/estadisticas",  tags=["Estadísticas"])