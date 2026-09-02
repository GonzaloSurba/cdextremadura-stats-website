/*
 * ExtremaduraStats
 * Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { BsPerson } from "react-icons/bs";

export default function FotoJugador({ jugador, size = 128 }) {
    const nombre = jugador.nombre_corto || `${jugador.nombre} ${jugador.apellidos.split(" ")[0]}`;

    const sizeStyle = { width: `${size}px`, height: `${size}px` };
    const icono = { width: `${size/2}px`, height: `${size/2}px` };

    return (
        <div 
            style={sizeStyle} 
            className={`bg-gray-200 rounded-full mx-auto border-4 border-secondary/20 flex items-center justify-center overflow-hidden`}
        >
            {jugador.ruta_foto ? (
                <img
                    src={jugador.ruta_foto}
                    alt={`Imagen de ${nombre}`}
                    style={sizeStyle}
                    className={`rounded-full object-cover border border-outline-variant bg-gray-50`}
                    loading="lazy"
                />
            ) : (
                <BsPerson style={icono} aria-hidden="true" />
            )}
        </div>
    );
}