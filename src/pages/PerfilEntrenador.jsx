/*
 * ExtremaduraStats
 * Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { entrenadoresApi } from '../services/api';
import Loader from '../components/Loader/Loader';
import CountryFlag from '../components/CountryFlag';
import ImagenGenericaEntrenador from '../assets/jugador-sin-foto.webp';
import { Helmet } from 'react-helmet-async';

function DatoPersonal({ label, value }) {
    return (
        <div>
            <p className="text-[10px] uppercase font-bold text-gray-500">{label}</p>
            <p className="font-bold text-secondary">{value || 'N/A'}</p>
        </div>
    );
}

function calcularEdad(fecha) {
    if (!fecha) return null;
    const hoy = new Date();
    const cumple = new Date(fecha);
    let edad = hoy.getFullYear() - cumple.getFullYear();
    const m = hoy.getMonth() - cumple.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) edad--;
    return edad;
}

export default function PerfilEntrenador() {
    const { id } = useParams();
    const [entrenador, setEntrenador] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargar = async () => {
            try {
                setLoading(true);
                const data = await entrenadoresApi.getWithDetails(id);
                setEntrenador(data);
            } catch (err) {
                console.error("Error al cargar el entrenador:", err);
                setError("No se pudo cargar el entrenador");
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [id]);

    const nombreMostrar = entrenador?.nombre_conocido || `${entrenador?.nombre} ${entrenador?.apellidos?.split(' ')[0] || ''}`;

    const tituloMeta = nombreMostrar
        ? `${nombreMostrar} — Estadísticas y trayectoria | Extremadura Stats`
        : "Entrenador del C. D. Extremadura | Extremadura Stats";

    const descripcionMeta = nombreMostrar
        ? `Infórmate sobre los registros y estadísticas de ${nombreMostrar} como entrenador del C. D. Extremadura. Partidos dirigidos, victorias, derrotas y trayectoria completa.`
        : "Infórmate sobre los registros y estadísticas de este entrenador en el C. D. Extremadura. Partidos dirigidos, victorias, derrotas y trayectoria completa.";

    const urlCanonical = `https://extremadurastats.es/entrenador/${id}`;

    return (
        <>
            <Helmet>
                <title>{tituloMeta}</title>
                <link rel="canonical" href={urlCanonical} />
                <meta name="description" content={descripcionMeta} />
                <meta property="og:type" content="website" />
                <meta property="og:locale" content="es_ES" />
                <meta property="og:title" content={tituloMeta} />
                <meta property="og:description" content={descripcionMeta} />
                <meta property="og:url" content={urlCanonical} />
                <meta property="og:image" content="https://extremadurastats.es/og-image.png" />
                <meta property="og:site_name" content="Extremadura Stats" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={tituloMeta} />
                <meta name="twitter:description" content={descripcionMeta} />
                <meta name="twitter:image" content="https://extremadurastats.es/og-image.png" />
                <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@graph": [
                            {
                                "@type": "WebPage",
                                "@id": `${urlCanonical}/#webpage`,
                                "url": `${urlCanonical}`,
                                "name": `${nombreMostrar} - Extremadura Stats`,
                                "description": `Estadísticas de ${nombreMostrar} con el C. D. Extremadura`,
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
                                    { "@type": "ListItem", "position": 2, "name": "Entrenadores", "item": "https://extremadurastats.es/entrenadores" },
                                    { "@type": "ListItem", "position": 3, "name": `${nombreMostrar || 'Entrenador'}`, "item": `${urlCanonical}` }
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
                <div className="max-w-5xl mx-auto px-lg py-xl space-y-xl">

                    <div className="bg-surface border border-outline-variant rounded-3xl p-xl flex flex-col md:flex-row gap-xl items-center shadow-sm">
                        <div className="w-48 h-64 bg-gray-200 rounded-2xl overflow-hidden shrink-0">
                            <img
                                src={entrenador.ruta_foto || ImagenGenericaEntrenador}
                                alt={`Foto de ${nombreMostrar}, entrenador del C. D. Extremadura`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-md">
                            <div className="space-y-1">
                                <h1 className="font-display-xl text-5xl uppercase tracking-tighter text-secondary">
                                    {nombreMostrar}
                                </h1>
                                <p className="text-sm font-medium text-gray-400 md:text-base tracking-normal">
                                    {`${entrenador.nombre} ${entrenador.apellidos}`}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-md justify-center md:justify-start">
                                <span className="flex gap-2 bg-secondary/10 text-secondary px-lg py-sm rounded-full font-bold text-sm">
                                    {entrenador.nacionalidad && <CountryFlag pais={entrenador.nacionalidad} />}
                                    {entrenador.nacionalidad}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-lg pt-md">
                                <DatoPersonal label="Edad" value={calcularEdad(entrenador.fecha_nacimiento) ? `${calcularEdad(entrenador.fecha_nacimiento)} años` : 'N/A'} />
                                <DatoPersonal label="Localidad" value={entrenador.localidad_nacimiento || 'Desconocida'} />
                                <DatoPersonal label="Temporadas" value={`${entrenador.total_temporadas}`} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-lg">
                        <div className="bg-surface border border-outline-variant p-lg rounded-2xl text-center shadow-sm">
                            <p className="font-display-xl text-3xl text-secondary">{entrenador.total_partidos}</p>
                            <p className="text-gray-500 text-xs uppercase font-bold mt-sm">Partidos</p>
                        </div>
                        <div className="bg-surface border border-outline-variant p-lg rounded-2xl text-center shadow-sm">
                            <p className="font-display-xl text-3xl text-green-600">{entrenador.total_victorias}</p>
                            <p className="text-gray-500 text-xs uppercase font-bold mt-sm">Victorias</p>
                        </div>
                        <div className="bg-surface border border-outline-variant p-lg rounded-2xl text-center shadow-sm">
                            <p className="font-display-xl text-3xl text-yellow-500">{entrenador.total_empates}</p>
                            <p className="text-gray-500 text-xs uppercase font-bold mt-sm">Empates</p>
                        </div>
                        <div className="bg-surface border border-outline-variant p-lg rounded-2xl text-center shadow-sm">
                            <p className="font-display-xl text-3xl text-red-500">{entrenador.total_derrotas}</p>
                            <p className="text-gray-500 text-xs uppercase font-bold mt-sm">Derrotas</p>
                        </div>
                        <div className="bg-surface border border-outline-variant p-lg rounded-2xl text-center shadow-sm">
                            <p className="font-display-xl text-3xl text-primary">
                                {entrenador.total_partidos > 0
                                    ? Math.round((entrenador.total_victorias / entrenador.total_partidos) * 100)
                                    : 0}%
                            </p>
                            <p className="text-gray-500 text-xs uppercase font-bold mt-sm">Ratio</p>
                            <p className="text-[10px] text-gray-500 uppercase">de victorias</p>
                        </div>
                    </div>

                    <div className="space-y-md">
                        <h2 className="font-display-xl text-2xl uppercase tracking-tighter">Trayectoria en el club</h2>
                        <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-surface-variant/20 text-xs font-bold uppercase text-gray-500">
                                        <tr>
                                            <th className="p-md">Temporada</th>
                                            <th className="p-md text-center">PJ</th>
                                            <th className="p-md text-center">G</th>
                                            <th className="p-md text-center">E</th>
                                            <th className="p-md text-center">P</th>
                                            <th className="p-md text-center text-[10px]">% Victorias</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entrenador.temporadas?.map(t => {
                                            const pct = t.partidos > 0 ? Math.round((t.victorias / t.partidos) * 100) : 0;
                                            return (
                                                <tr key={t.temporada_id} className="border-t border-outline-variant hover:bg-surface-variant/10 transition-colors">
                                                    <td className="p-md font-bold text-sm md:text-base">{t.temporada_nombre}</td>
                                                    <td className="p-md text-center font-medium text-sm">{t.partidos}</td>
                                                    <td className="p-md text-center font-bold text-sm text-green-600">{t.victorias}</td>
                                                    <td className="p-md text-center text-sm text-yellow-500">{t.empates}</td>
                                                    <td className="p-md text-center text-sm text-red-500">{t.derrotas}</td>
                                                    <td className="p-md text-center text-sm font-semibold text-primary">{pct}%</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </>
    );
}