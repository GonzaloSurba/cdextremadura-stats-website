# ExtremaduraStats
# Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
import uvicorn
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from router import api_router
from app.core.limiter import limiter
from app.api.v1.endpoints.sitemap import router as sitemap_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION
    )

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5500",
    "http://192.168.1.43:5173",
    "http://192.168.1.43",
]

app.add_middleware(SlowAPIMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,             # Permite el origen de Vite
    allow_credentials=True,
    allow_methods=["*"],               # Permite todos los métodos (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],               # Permite todos los headers
)

app.include_router(sitemap_router)
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "API de estadísticas del Club Deportivo Extremadura"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)