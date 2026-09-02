/*
 * ExtremaduraStats
 * Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
const BASE = import.meta.env.VITE_API_URL ?? (() => { throw new Error('VITE_API_URL no definida') })()
const getToken = () => null

// ── Fetch helper ──────────────────────────────────────────────────────────────

async function request(path, options = {}, auth = false) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    }

    if (auth) {
        const token = getToken()
        if (token) headers['Authorization'] = `Bearer ${token}`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10_000)

    try {
        const res = await fetch(`${BASE}${path}`, { ...options, headers, signal: controller.signal, })

        if (!res.ok) {
            // Intentamos parsear el error, si falla usamos el statusText
            const err = await res.json().catch(() => ({ detail: res.statusText }))
            throw new Error(err.detail ?? 'Error en la API')
        }

        // Si no hay contenido (status 204), no intentamos hacer .json()
        if (res.status === 204) return undefined

        return res.json()
    } catch (err) {
        if (err.name === 'AbortError') {
            throw new Error('La petición tardó demasiado. Inténtalo de nuevo.')
        }
        throw err
    } finally {
        clearTimeout(timeoutId)
    }
}

// ── Partidos ──────────────────────────────────────────────────────────────────

export const partidosApi = {
    list: (competicion_temporada_id) =>
        request(`/partidos/temporada/${competicion_temporada_id}`),

    get: (id) =>
        request(`/partidos/${id}`),

    create: (data) =>
        request('/partidos', { method: 'POST', body: JSON.stringify(data) }, true),

    update: (id, data) =>
        request(`/partidos/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true),

    delete: (id) =>
        request(`/partidos/${id}`, { method: 'DELETE' }, true),

    getEfemerides: () => 
        request('/partidos/efemerides/hoy'),
}

// ── Goles ─────────────────────────────────────────────────────────────────────

export const golesApi = {
    list: (partido_id) =>
        request(`/partidos/${partido_id}/goles`),

    create: (data) =>
        request('/goles', { method: 'POST', body: JSON.stringify(data) }, true),

    delete: (id) =>
        request(`/goles/${id}`, { method: 'DELETE' }, true),
}

// ── Tarjetas ──────────────────────────────────────────────────────────────────

export const tarjetasApi = {
    list: (partido_id) =>
        request(`/partidos/${partido_id}/tarjetas`),

    create: (data) =>
        request('/tarjetas', { method: 'POST', body: JSON.stringify(data) }, true),

    delete: (id) =>
        request(`/tarjetas/${id}`, { method: 'DELETE' }, true),
}

// ── Datos auxiliares ──────────────────────────────────────────────────────────

export const equiposApi = {
    list: () => request('/equipos'),

    get: (id) =>
        request(`/equipos/${id}`),
}

export const jugadoresApi = {
    get: (id) =>
        request(`/jugadores/${id}`),

    getWithDetails: (id) =>
        request(`/jugadores/detalles/${id}`),

    listByTemporada: (temporada_id) =>
        request(`/jugadores?temporada_id=${temporada_id}`),

    listHistorico: () =>
        request('/jugadores/historico'),
}

export const estadisticasJugadoresApi = {
    getByFilters: (filtros = {}) => {
        const query = new URLSearchParams(filtros).toString();
        return request(`/estadisticas/jugadores${query ? `?${query}` : ''}`);
    }
}

export const entrenadoresApi = {
    get: (id) =>
        request(`/entrenadores/${id}`),

    getWithDetails: (id) =>
        request(`/entrenadores/detalles/${id}`),

    listHistorico: () =>
        request('/entrenadores/historico'),
}

export const competicionesApi = {
    listTemporadas: () => request('/competiciones/temporadas'),
    listTrofeos: () => request('/trofeos')
}

export const clasificacionApi = {
    getByTemporada: (competicion_temporada_id) => 
        request(`/estadisticas/clasificacion?competicion_temporada_id=${competicion_temporada_id}`),
}

export const estadisticasEquipoApi = {
    getGenerales: () => 
        request('/estadisticas/generales'),
}