/*
 * ExtremaduraStats
 * Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
export function eventoTipo(tipo) {
    const eventos = {
        "falta_directa": "falta directa",
        "propia_puerta": "en propia puerta",
        "doble_amarilla": "segunda amarilla"
    }

    if (eventos[tipo]) {
        return eventos[tipo];
    }
    return tipo;
}

export function formatearFecha(fechaStr) {
    if (!fechaStr) return;
    const fecha = new Date(fechaStr);
    return {
        fechaTexto: fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
        horaTexto: fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
}