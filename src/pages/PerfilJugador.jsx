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
import { jugadoresApi } from '../services/api';
import Loader from '../components/Loader/Loader';
import { BsPersonBadge, BsSquareFill } from "react-icons/bs";
import FootballBall from '../components/Icons/FootballBall';
import Stadium from '../components/Icons/Stadium';
import FootballCard from '../components/Icons/FootballCard';
import CountryFlag from '../components/CountryFlag';
import ImagenGenericaJugador from '../assets/jugador-sin-foto.webp';
import { Helmet } from 'react-helmet-async';

function DatoPersonal({ label, value }) {
    return (
        <div>
            <p className="text-[10px] uppercase font-bold text-gray-400">{label}</p>
            <p className="font-bold text-secondary">{value || 'N/A'}</p>
        </div>
    );
}

function CardStat({ icon, label, value, sub }) {
    return (
        <div className="bg-surface border border-outline-variant p-lg rounded-2xl text-center shadow-sm">
            <span className="text-3xl flex justify-center">{icon}</span>
            <p className="text-gray-500 text-xs uppercase font-bold mt-sm">{label}</p>
            <p className="font-display-xl text-3xl text-primary">{value}</p>
            <p className="text-[10px] text-gray-400 uppercase">{sub}</p>
        </div>
    );
}

function calcularEdad(fecha) {
    if (!fecha) return 'N/A';
    const hoy = new Date();
    const cumple = new Date(fecha);
    let edad = hoy.getFullYear() - cumple.getFullYear();
    const m = hoy.getMonth() - cumple.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) edad--;
    return edad;
}

export default function PerfilJugador() {
    const { id } = useParams();
    const [jugador, setJugador] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarJugador = async () => {
            try {
                setLoading(true);
                const data = await jugadoresApi.getWithDetails(id);
                setJugador(data);
            } catch (err) {
                console.error("Error al cargar el jugador:", err);
                setError("No se pudo cargar el jugador");
            } finally {
                setLoading(false);
            }
        };
        cargarJugador();
    }, [id]);

    const nombreJugador = jugador?.nombre_conocido || `${jugador?.nombre} ${jugador?.apellidos.split(" ")[0]}`;

    const tituloMeta = nombreJugador
        ? `${nombreJugador} — Estadísticas y trayectoria | Extremadura Stats`
        : "Jugador del C. D. Extremadura | Extremadura Stats";

    const descripcionMeta = nombreJugador
        ? `Infórmate sobre los registros y estadísticas de ${nombreJugador} en el C. D. Extremadura. Goles, partidos, tarjetas y trayectoria completa en el club.`
        : "Infórmate sobre todos los registros y estadísticas conseguidos por este jugador en el C. D. Extremadura. Goles, partidos, tarjetas y trayectoria completa en el club.";

    const urlCanonical = `https://extremadurastats.es/jugador/${id}`;

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
                <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
                <meta name="twitter:image" content="https://extremadurastats.es/og-image.png" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@graph": [
                            {
                                "@type": "WebPage",
                                "@id": `${urlCanonical}/#webpage`,
                                "url": `${urlCanonical}`,
                                "name": `${nombreJugador} - Extremadura Stats`,
                                "description": `Estadísticas de ${nombreJugador} con el C. D. Extremadura`,
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
                                    { "@type": "ListItem", "position": 2, "name": "Jugadores", "item": "https://extremadurastats.es/jugadores" },
                                    { "@type": "ListItem", "position": 3, "name": `${nombreJugador || 'Jugador'}`, "item": `${urlCanonical}` }
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
                    const posicionPrincipal = jugador?.posiciones?.find(pos => pos.es_posicion_principal === true) || null;
                    const stats = {
                        partidos: jugador.estadisticas.partidos_jugados || 0,
                        titularidades: jugador.estadisticas.partidos_titular || 0,
                        suplentes: jugador.estadisticas.partidos_suplente || 0, // Entró como suplente
                        goles: jugador.estadisticas.goles || 0,
                        asistencias: jugador.estadisticas.asistencias || 0,
                        amarillas: jugador.estadisticas.tarjetas_amarillas || 0,
                        rojas: jugador.estadisticas.tarjetas_rojas || 0
                    };

                    return (
                        <div className="max-w-5xl mx-auto px-lg py-xl space-y-xl">
                            {/* CABECERA PERFIL */}
                            <div className="bg-surface border border-outline-variant rounded-3xl p-xl flex flex-col md:flex-row gap-xl items-center shadow-sm">
                                <div className="w-48 h-64 bg-gray-200 rounded-2xl overflow-hidden shrink-0">
                                    <img
                                        src={jugador.ruta_foto || ImagenGenericaJugador}
                                        alt={`Foto de ${nombreJugador}, futbolista del C. D. Extremadura`}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>

                                <div className="flex-1 text-center md:text-left space-y-md">
                                    <div className="space-y-1">
                                        <h1 className="font-display-xl text-5xl uppercase tracking-tighter text-secondary">
                                            {nombreJugador}
                                        </h1>

                                        <p className="text-sm font-medium text-gray-400 md:text-base tracking-normal">
                                            {`${jugador.nombre} ${jugador.apellidos}`}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-md justify-center md:justify-start">
                                        <span className="bg-primary/10 text-primary px-lg py-sm rounded-full font-bold text-sm">
                                            {posicionPrincipal.nombre || 'Sin posición'}
                                        </span>
                                        <span className="flex gap-2 bg-secondary/10 text-secondary px-lg py-sm rounded-full font-bold text-sm">
                                            {<CountryFlag pais={jugador.nacionalidad} />} {jugador.nacionalidad}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-lg pt-md">
                                        <DatoPersonal label="Edad" value={`${calcularEdad(jugador.fecha_nacimiento)} años`} />
                                        <DatoPersonal label="Altura" value={`${jugador.altura || 'N/A'} cm`} />
                                        <DatoPersonal label="Pie" value={jugador.pie_dominante} />
                                        <DatoPersonal label="Localidad" value={
                                            jugador.localidad_nacimiento && jugador.pais_nacimiento
                                                ? `${jugador.localidad_nacimiento}, ${jugador.pais_nacimiento}`
                                                : 'Desconocida'
                                            } 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* REGISTROS HISTÓRICOS */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                                <CardStat
                                    icon={<FootballBall width={30} height={30} />}
                                    label="Goles totales" value={stats.goles}
                                    sub={`${stats.asistencias} asistencias`}
                                />
                                <CardStat
                                    icon={<Stadium width={30} height={30} />}
                                    label="Partidos" value={stats.partidos}
                                    sub={`${stats.titularidades} titularidades`}
                                />
                                <CardStat
                                    icon={<FootballCard width={30} height={30} fillcard={"yellow"} />}
                                    label="Disciplina" value={`${stats.amarillas} / ${stats.rojas}`}
                                    sub="Amarillas / Rojas"
                                />
                            </div>

                            {/* HISTORIAL DE TEMPORADAS */}
                            <div className="space-y-md">
                                <h2 className="font-display-xl text-2xl uppercase tracking-tighter">Trayectoria en el club</h2>
                                <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-surface-variant/20 text-xs font-bold uppercase text-gray-500">
                                                <tr>
                                                    <th className="p-md">Temporada</th>
                                                    <th className="p-md text-center">Dorsal</th>
                                                    <th className="p-md text-center">PJ</th>
                                                    <th className="p-md text-center">Goles</th>
                                                    <th className="p-md text-center">Asist.</th>
                                                    <th className="p-md text-center">
                                                        <span className='flex justify-center'>
                                                            <FootballCard width={30} height={30} fillcard={"yellow"} />
                                                        </span>
                                                    </th>
                                                    <th className="p-md text-center">
                                                        <span className='flex justify-center'>
                                                            <FootballCard width={30} height={30} fillcard={"red"} />
                                                        </span>
                                                    </th>
                                                    <th className="p-md text-right">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {jugador.temporadas?.map(t => (
                                                    <tr key={t.temporada_id} className="border-t border-outline-variant hover:bg-surface-variant/10 transition-colors">
                                                        <td className="p-md font-bold text-sm md:text-base">{t.nombre_temporada}</td>
                                                        <td className="p-md text-center text-primary font-display-xl text-lg font-semibold">
                                                            {t.dorsal || '-'}
                                                        </td>
                                                        <td className="p-md text-center font-medium text-sm">{t.partidos_jugados}</td>
                                                        <td className="p-md text-center font-bold text-sm text-secondary">{t.goles || '-'}</td>
                                                        <td className="p-md text-center text-sm text-gray-600">{t.asistencias || '-'}</td>
                                                        <td className="p-md text-center text-sm font-semibold text-yellow-600">
                                                            {t.tarjetas_amarillas || '-'}
                                                        </td>
                                                        <td className="p-md text-center text-sm font-semibold text-red-600">
                                                            {t.tarjetas_rojas || '-'}
                                                        </td>
                                                        <td className="p-md text-right uppercase text-[10px] font-bold tracking-wider text-gray-400">
                                                            {t.estado}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })()
            )
            }

        </>
    );
}
