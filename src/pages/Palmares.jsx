/*
 * ExtremaduraStats
 * Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import React, { useState, useEffect } from 'react';
import { competicionesApi } from '../services/api';
import Loader from '../components/Loader/Loader';
import { BsTrophy, BsAward } from "react-icons/bs";
import { Helmet } from 'react-helmet-async';
import Trophy from '../components/Icons/Trophy';

export default function Palmares() {
    const [trofeos, setTrofeos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarPalmares = async () => {
            try {
                setLoading(true);
                const data = await competicionesApi.listTrofeos();
                setTrofeos(data);
            } catch (err) {
                console.error("Error cargando palmarés:", err);
                setError("No se pudieron cargar los jugadores");
            } finally {
                setLoading(false);
            }
        };
        cargarPalmares();
    }, []);

    return (
        <>
            <Helmet>
                <title>Palmarés y títulos del C. D. Extremadura | Extremadura Stats</title>
                <link rel="canonical" href="https://extremadurastats.es/palmares" />
                <meta name="description" content="Explora todos los títulos, ascensos y trofeos conseguidos por el C. D. Extremadura a lo largo de su historia. El palmarés del club azulgrana en una sola web." />
                <meta property="og:type" content="website" />
                <meta property="og:locale" content="es_ES" />
                <meta property="og:title" content="Palmarés y títulos del C. D. Extremadura | Extremadura Stats" />
                <meta property="og:description" content="Explora todos los títulos, ascensos y trofeos conseguidos por el C. D. Extremadura a lo largo de su historia. El palmarés del club azulgrana en una sola web." />
                <meta property="og:url" content="https://extremadurastats.es/palmares" />
                <meta property="og:image" content="https://extremadurastats.es/og-image.png" />
                <meta property="og:site_name" content="Extremadura Stats" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Palmarés y títulos del C. D. Extremadura | Extremadura Stats" />
                <meta name="twitter:description" content="Explora todos los títulos, ascensos y trofeos conseguidos por el C. D. Extremadura a lo largo de su historia. El palmarés del club azulgrana en una sola web." />
                <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
                <meta name="twitter:image" content="https://extremadurastats.es/og-image.png" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@graph": [
                            {
                                "@type": "WebPage",
                                "@id": "https://extremadurastats.es/palmares/#webpage",
                                "url": "https://extremadurastats.es/palmares",
                                "name": "Palmarés - Extremadura Stats",
                                "description": "Palmarés con todos los títulos del C. D. Extremadura.",
                                "publisher": {
                                    "@type": "Organization",
                                    "@id": "https://extremadurastats.es/#organization",
                                    "name": "Extremadura Stats",
                                    "url": "https://extremadurastats.es"
                                },
                                "inLanguage": "es-ES"
                            },
                            {
                                "@type": "BreadcrumbList",
                                "itemListElement": [
                                    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://extremadurastats.es" },
                                    { "@type": "ListItem", "position": 2, "name": "Palmarés", "item": "https://extremadurastats.es/palmares" }
                                ]
                            }
                        ]
                    })}
                </script>
            </Helmet>

            {loading ? (
                <Loader />
            ) : error ? (
                <p className="text-center py-xl text-red-500" role="alert">{error}</p>
            ) : (
                (() => {
                    const palmaresAgrupado = trofeos.reduce((acc, t) => {
                        const compRel = t.competicion_temporada_rel;
                        const compBase = compRel?.competicion_rel;
                        const tempBase = compRel?.temporada_rel;

                        if (!compBase) return acc;

                        const compId = compBase.id;

                        if (!acc[compId]) {
                            acc[compId] = {
                                nombre: compBase.nombre,
                                tipo: compBase.tipo,
                                pais: compBase.pais,
                                oficial: compBase.oficial,
                                edicionesGanadas: []
                            };
                        }

                        acc[compId].edicionesGanadas.push({
                            id: t.id,
                            temporadaId: tempBase?.id || 0,
                            temporadaNombre: tempBase?.nombre || `Edición ${compRel.id}`,
                            equipos: compRel.num_equipos,
                            jornadas: compRel.num_jornadas,
                            grupo: compRel.grupo
                        });

                        return acc;
                    }, {});

                    const listaCompeticionesGanadas = Object.values(palmaresAgrupado);
                    const titulosOficiales = listaCompeticionesGanadas
                        .filter(c => c.oficial)
                        .map(comp => {
                            const edicionesOrdenadas = [...comp.edicionesGanadas].sort((a, b) => a.temporadaId - b.temporadaId);
                            return {
                                ...comp,
                                edicionesGanadas: edicionesOrdenadas
                            };
                        })
                        .sort((a, b) => {
                            const primerIdA = a.edicionesGanadas[0]?.temporadaId || 0;
                            const primerIdB = b.edicionesGanadas[0]?.temporadaId || 0;
                            return primerIdA - primerIdB;
                        });

                    const totalTitulos = trofeos.length;
                    const totalLigas = trofeos.filter(t => t.competicion_temporada_rel?.competicion_rel?.tipo === 'liga').length;
                    const totalCopas = trofeos.filter(t => t.competicion_temporada_rel?.competicion_rel?.tipo === 'copa').length;
                    const totalTodasCompeticiones = titulosOficiales.length;

                    const mapTotalesPalmares = [
                        { value: totalTitulos, label: "Títulos totales", accent: true },
                        { value: totalLigas, label: "Ligas" },
                        { value: totalCopas, label: "Copas" },
                        { value: totalTodasCompeticiones, label: "Competiciones" },
                    ];

                    return (
                        <div className="max-w-5xl mx-auto px-lg py-xl space-y-xl">

                            {/* CABECERA DE LA VITRINA */}
                            <div className="border-b border-outline-variant pb-lg flex items-center gap-md">
                                <div className="bg-primary/10 p-md rounded-2xl text-primary text-3xl">
                                    <BsTrophy aria-hidden="true" />
                                </div>
                                <div>
                                    <h1 className="font-display-xl text-4xl uppercase tracking-tighter text-secondary">
                                        Vitrina de Trofeos
                                    </h1>
                                    <p className="text-on-surface-variant">El palmarés histórico del club</p>
                                </div>
                            </div>

                            {/* CONTADOR RESUMEN HISTÓRICO */}
                            <div className="bg-secondary text-white rounded-3xl p-xl shadow-md relative overflow-hidden">

                                <div className="grid grid-cols-2 md:grid-cols-4 md:divide-x md:divide-white/10 gap-md md:gap-0 relative z-10">

                                    {mapTotalesPalmares.map(({ value, label, accent }, i) => (
                                        <div key={label} className={`flex flex-col justify-center
                            ${i < 2 ? "pb-sm md:pb-0" : "pt-sm md:pt-0"}
                            ${i === 0 ? "md:pr-lg" : i === 3 ? "md:pl-lg" : "md:px-lg"}
                        `}>
                                            <span className={`font-display-xl text-5xl tracking-tighter leading-none ${accent ? "text-primary" : "text-white"}`}>
                                                {value}
                                            </span>
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-300 mt-xs">
                                                {label}
                                            </span>
                                        </div>
                                    ))}

                                </div>

                                <BsTrophy aria-hidden="true" className="absolute -right-6 -bottom-10 text-[200px] text-white/5 pointer-events-none" />
                            </div>

                            {/* CUADRÍCULA DE CAMPEONATOS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                                {titulosOficiales.map((comp, index) => (
                                    <div
                                        key={index}
                                        className="bg-surface border border-outline-variant rounded-3xl p-lg flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm group"
                                    >
                                        <div className="space-y-md">
                                            {/* Badges superiores */}
                                            <div className="flex items-center justify-between">
                                                <span className={`text-xs font-bold uppercase tracking-widest px-sm py-xs rounded-lg ${comp.tipo === 'liga' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                                                    }`}>
                                                    {comp.tipo}
                                                </span>
                                                <div className="flex items-center gap-xs text-xs font-bold text-primary">
                                                    <BsAward aria-hidden="true" /> {comp.edicionesGanadas.length} {comp.edicionesGanadas.length === 1 ? 'Título' : 'Títulos'}
                                                </div>
                                            </div>

                                            {/* Info de la Competición */}
                                            <div>
                                                <h2 className="font-display-xl text-xl uppercase tracking-tight text-secondary group-hover:text-primary transition-colors">
                                                    {comp.nombre}
                                                </h2>
                                                <p className="text-xs text-gray-400 uppercase tracking-normal">{comp.pais}</p>
                                            </div>
                                        </div>

                                        {/* Listado de Temporadas Campeones */}
                                        <div className="mt-xl pt-md border-t border-outline-variant/50 space-y-xs">
                                            <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Temporadas campeones</p>
                                            <div className="flex flex-wrap gap-xs">
                                                {comp.edicionesGanadas.map((edicion, idx) => {
                                                    // Generamos un texto de ayuda dinámico (tooltip) aprovechando los datos reales
                                                    const tooltipInfo = `${edicion.jornadas} jornadas | ${edicion.equipos} equipos${edicion.grupo ? ` | Grupo ${edicion.grupo}` : ''}`;

                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="bg-surface-variant/20 border border-outline-variant/40 px-lg py-sm rounded-xl font-display-xl text-sm text-secondary flex items-center gap-xs hover:bg-primary/5 transition-colors cursor-help"
                                                            title={tooltipInfo}
                                                        >
                                                            <Trophy width={12} height={12} />
                                                            {edicion.temporadaNombre}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                    </div>
                                ))}
                            </div>

                            {titulosOficiales.length === 0 && (
                                <p className="text-center py-xl text-gray-400 italic">No se han registrado trofeos en el palmarés todavía.</p>
                            )}

                        </div>
                    )
                })()
            )
            }
        </>
    );
}