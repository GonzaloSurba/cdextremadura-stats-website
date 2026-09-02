# ExtremaduraStats
# Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Partido, Jugador, Entrenador
from app.core.config import settings
from datetime import date

router = APIRouter(tags=["Sitemap"])

@router.get("/sitemap.xml", include_in_schema=False)
def get_sitemap(db: Session = Depends(get_db)):
    domain = settings.DOMAIN
    base_url = f"https://{domain}"

    # 1. Recuperar datos de la BD
    partidos = db.query(Partido.id, Partido.fecha).all()
    jugadores = db.query(Jugador.id).all()
    entrenadores = db.query(Entrenador.id).all()
    ultimo = db.query(Partido.fecha).order_by(Partido.fecha.desc()).first()
    fecha_ultimo_partido = ultimo.fecha.strftime("%Y-%m-%d") if ultimo else "2026-06-05"
    fecha_hoy = date.today()

    urls = []

    # 2. Rutas estáticas
    static_pages = [
        ("", "1.0"),
        ("/temporadas", "0.8"),
        ("/palmares", "0.8"),
        ("/jugadores", "0.8"),
        ("/entrenadores", "0.8"),
        ("/contacto", "0.5"),
        ("/politica-privacidad", "0.5"),
        ("/aviso-legal", "0.5"),
    ]
    for path, priority in static_pages:
        if path in ["/temporadas", "/palmares", "/jugadores", "/entrenadores"]:
            lastmod = fecha_ultimo_partido
        else:
            lastmod = "2026-06-05"
        urls.append(f"""  <url>
    <loc>{base_url}{path}</loc>
    <lastmod>{lastmod}</lastmod>
    <priority>{priority}</priority>
  </url>""")

    # 3. Partidos dinámicos
    for p in partidos:
        lastmod = p.fecha.strftime("%Y-%m-%d") if p.fecha and p.fecha.date() <= fecha_hoy else ""
        lastmod_tag = f"\n    <lastmod>{lastmod}</lastmod>" if lastmod else ""
        urls.append(f"""  <url>
    <loc>{base_url}/partido/{p.id}</loc>{lastmod_tag}
    <priority>0.6</priority>
  </url>""")

    # 4. Jugadores dinámicos
    for j in jugadores:
        urls.append(f"""  <url>
    <loc>{base_url}/jugador/{j.id}</loc>
    <lastmod>{fecha_ultimo_partido}</lastmod>
    <priority>0.6</priority>
  </url>""")
        
    # 5. Entrenadores dinámicos
    for e in entrenadores:
        urls.append(f"""  <url>
    <loc>{base_url}/entrenador/{e.id}</loc>
    <lastmod>{fecha_ultimo_partido}</lastmod>
    <priority>0.6</priority>
  </url>""")

    # 6. Montar XML
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>"""

    return Response(content=xml, media_type="application/xml")