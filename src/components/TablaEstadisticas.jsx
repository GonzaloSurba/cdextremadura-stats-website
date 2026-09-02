/*
 * ExtremaduraStats
 * Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { Link } from "react-router-dom";

export default function TablaEstadisticas({ titulo, columnas, datos }) {
    return (
        <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden flex flex-col h-full">
            <div className="p-md border-b border-outline-variant bg-surface-variant/10">
                <h3 className="font-display-xl text-lg uppercase tracking-tighter text-secondary">{titulo}</h3>
            </div>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-outline-variant">
                        {columnas.map((col, i) => {
                            const esObjeto = typeof col === 'object' && col !== null && !col.$$typeof; // excluye JSX
                            const label = esObjeto ? col.label : col;
                            const icono = esObjeto ? col.icono : null;

                            return (
                                <th key={label} className='px-md py-sm' aria-label={label}>
                                    <span className={`${i > 0 ? 'flex justify-end items-center' : ''}`}>
                                        {icono
                                            ? <span aria-hidden="true">{icono}</span>
                                            : label
                                        }
                                    </span>
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {datos.slice(0, 5).map((fila, i) => ( // Mostramos top 5
                        <tr key={fila.id} className="border-b border-outline-variant/30 last:border-0 hover:bg-primary/5 transition-colors">
                            {Object.entries(fila)
                                .filter(([key]) => key !== "id")
                                .map(([key, val], j) => (
                                    <td key={key} className={`px-md py-sm ${j === 0 ? 'font-bold' : 'text-right'}`}>
                                        {j === 0 && fila.id ? (
                                            <Link
                                                to={`/jugador/${fila.id}`}
                                                className="hover:text-primary hover:underline transition-colors"
                                            >
                                                {val}
                                            </Link>
                                        ) : val}
                                    </td>
                                ))
                            }
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}