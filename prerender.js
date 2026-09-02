/*
 * ExtremaduraStats
 * Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import fs from 'node:fs'
import path from 'node:path'

const API_URL = process.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

const [partidos, jugadores] = await Promise.all([
    fetch(`${API_URL}/partidos/`).then(r => r.json()),
    fetch(`${API_URL}/jugadores/`).then(r => r.json()),
]).catch(() => {
    console.error('No se pudo conectar a la API. ¿Está levantada?')
    process.exit(1)
})

const staticRoutes = [
    '/',
    '/temporadas',
    '/palmares',
    '/jugadores',
    '/contacto',
    '/politica-privacidad',
    '/aviso-legal',
]

const dynamicRoutes = [
    ...partidos.map(p => `/partido/${p.id}`),
    ...jugadores.map(j => `/jugador/${j.id}`),
]

const allRoutes = [...staticRoutes, ...dynamicRoutes]

const template = fs.readFileSync('./dist/index.html', 'utf-8')

const { render } = await import('./dist/server/entry-server.js')

for (const route of allRoutes) {
    const { html, helmet } = render(route)

    const headTags = [
        helmet.title.toString(),
        helmet.meta.toString(),
        helmet.link.toString(),
    ].join('\n    ')

    const out = template
        .replace('<!--helmet-head-->', headTags)
        .replace('<!--app-html-->', html)

    const filePath = route === '/'
        ? './dist/index.html'
        : `./dist${route}/index.html`

    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, out)
    console.log('✓', route)
}

console.log(`\n${allRoutes.length} páginas generadas`)