/*
 * ExtremaduraStats
 * Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
function CampoFila({ children, className }) {
    return (
        <td className={`p-lg ${className}`}>{children}</td>
    )
}

function FilaEquipoClasificacion({ index, nombre_corto, pj, pg, pe, pp, gf, gc, dg, pts }) {
    return (
        <tr className={`border-t border-outline-variant ${index === 0 ? 'bg-yellow-300/5' : 'bg-primary/5'}`}>
            <CampoFila className={"font-bold"}>{index + 1}</CampoFila>
            <CampoFila className={"font-bold"}>{nombre_corto}</CampoFila>
            <CampoFila>{pj}</CampoFila>
            <CampoFila>{pg}</CampoFila>
            <CampoFila>{pe}</CampoFila>
            <CampoFila>{pp}</CampoFila>
            <CampoFila>{gf}</CampoFila>
            <CampoFila>{gc}</CampoFila>
            <CampoFila>{dg}</CampoFila>
            <CampoFila className={"font-display-xl text-primary text-xl"}>{pts}</CampoFila>
        </tr>
    )
}

export default function TablaClasificacion({ clasificacion }) {
    return (
        <div className="bg-surface border border-outline-variant rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-variant/30 text-xs font-bold uppercase tracking-widest text-gray-500">
                            <th className="p-lg" title="Posición">Pos</th>
                            <th className="p-lg">Equipo</th>
                            <th className="p-lg" title="Partidos jugados">PJ</th>
                            <th className="p-lg" title="Partidos ganados">PG</th>
                            <th className="p-lg" title="Partidos empatados">PE</th>
                            <th className="p-lg" title="Partidos perdidos">PP</th>
                            <th className="p-lg" title="Goles a favor">GF</th>
                            <th className="p-lg" title="Goles en contra">GC</th>
                            <th className="p-lg" title="Diferencia de goles">DF</th>
                            <th className="p-lg text-primary" title="Puntos">PTS</th>
                        </tr>
                    </thead>
                    <tbody className="font-body-md">
                        {clasificacion.map((equipo, index) => (
                            <FilaEquipoClasificacion key={equipo.equipo_id} index={index} {...equipo} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}