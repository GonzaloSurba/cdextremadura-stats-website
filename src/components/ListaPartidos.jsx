/*
 * ExtremaduraStats
 * Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import VerPartido from "./VerPartido";

function obtenerNombreRonda(jornadaNum, competicionTemporadaRel) {
    if (!competicionTemporadaRel) return `Jornada ${jornadaNum}`;
    
    const { num_jornadas, competicion_rel } = competicionTemporadaRel;
    const esCopa = competicion_rel?.tipo === "copa";
    
    // Si no es copa o no tenemos el total de rondas, usamos el formato estándar
    if (!esCopa || !num_jornadas || isNaN(jornadaNum)) {
        return `Jornada ${jornadaNum}`;
    }

    const distanciaALaFinal = num_jornadas - Number(jornadaNum);

    const mapeoRondas = {
        0: "Final",
        1: "Semifinal",
        2: "Cuartos de final",
        3: "Octavos de final",
        4: "Dieciseisavos de final",
        5: "Treintaidosavos de final"
    };

    return mapeoRondas[distanciaALaFinal] || `${jornadaNum}ª eliminatoria`;
}

export default function ListaPartidos({ partidos }) {
    if (partidos.length === 0) return <p className="text-center py-xl italic">No hay partidos registrados para esta temporada.</p>;

    const partidosPorJornada = partidos.reduce((acc, p) => {
        const jornada = p.jornada || "Otras";
        if (!acc[jornada]) acc[jornada] = [];
        acc[jornada].push(p);
        return acc;
    }, {});

    const jornadasOrdenadas = Object.keys(partidosPorJornada).sort((a, b) => Number(a) - Number(b));

    return (
        <div className="space-y-12">
            {jornadasOrdenadas.map(jornada => {
                // Tomamos el primer partido de la tanda para inspeccionar la competición
                const primerPartido = partidosPorJornada[jornada][0];
                const tituloRonda = obtenerNombreRonda(jornada, primerPartido?.competicion_temporada_rel);
                
                return (
                    <section key={jornada} className="space-y-4">
                        <div className="flex items-center gap-4">
                            <h3 className="font-display-xl text-xl uppercase tracking-tighter text-gray-400 whitespace-nowrap">
                                {tituloRonda}
                            </h3>
                            <div className="h-px w-full bg-outline-variant"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                            {partidosPorJornada[jornada].map(p => (
                                <div key={p.id} className="bg-surface border border-outline-variant rounded-2xl p-md flex items-center justify-between hover:border-primary/50 transition-colors">
                                    <div className="text-center flex-1 font-bold text-sm">{p.equipo_local_rel.nombre_corto || p.equipo_local_rel.nombre}</div>
                                    <div className="flex flex-col items-center gap-xs px-md">
                                        <div className="bg-secondary text-white font-display-xl px-md py-xs rounded-lg text-xl tracking-tighter">
                                            {p.goles_local}
                                            {p.penaltis_local != null && ` (${p.penaltis_local})`}
                                            {' - '}
                                            {p.penaltis_visitantes != null && `(${p.penaltis_visitantes}) `}
                                            {p.goles_visitante}
                                        </div>
                                        {(p.equipo_local === 1 || p.equipo_visitante === 1) && <VerPartido partido_id={p.id} />}
                                    </div>
                                    <div className="text-center flex-1 font-bold text-sm">{p.equipo_visitante_rel.nombre_corto || p.equipo_visitante_rel.nombre}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}