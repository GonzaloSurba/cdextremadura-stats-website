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
import Loader from '../components/Loader/Loader';
import { partidosApi, estadisticasJugadoresApi, estadisticasEquipoApi } from '../services/api';
import { BsCalendar3, BsPersonBadge, BsGraphUp, BsChevronRight } from "react-icons/bs";
import { NavLink, Link } from 'react-router-dom';
import StatCard from '../components/StatsCard';
import LogrosCard from '../components/LogrosCard';
import VerPartido from '../components/VerPartido';
import FotoJugador from '../components/FotoJugador';
import { Helmet } from 'react-helmet-async';
import { formatearFecha } from '../services/utils';

const Home = () => {

    const [datos, setDatos] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Obtengo los datos que devuelve estadisticasJugadoresApi()
        const cargarDatos = async () => {
            try {
                setLoading(true);
                const [partidosHoy, jugadores, estadisticasGenerales] = await Promise.all([
                    partidosApi.getEfemerides(),
                    estadisticasJugadoresApi.getByFilters(),
                    estadisticasEquipoApi.getGenerales()
                ])
                setDatos({ partidosHoy, jugadores, estadisticasGenerales });
            } catch (err) {
                console.error("Error al cargar jugadores:", err);
                setError("No se pudieron cargar los datos");
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, []);

    return (
        <>
            <Helmet>
                <title>Estadísticas del C. D. Extremadura | Extremadura Stats</title>
                <link rel="canonical" href="https://extremadurastats.es" />
                <meta name="description" content="Bienvenido a Extremadura Stats, con estadísticas completas del C. D. Extremadura. Explora partidos, jugadores, clasificaciones y palmarés del club azulgrana." />
                <meta property="og:type" content="website" />
                <meta property="og:locale" content="es_ES" />
                <meta property="og:title" content="Estadísticas del C. D. Extremadura | Extremadura Stats" />
                <meta property="og:description" content="Bienvenido a Extremadura Stats, con estadísticas completas del C. D. Extremadura. Explora partidos, jugadores, clasificaciones y palmarés del club azulgrana." />
                <meta property="og:url" content="https://extremadurastats.es" />
                <meta property="og:image" content="https://extremadurastats.es/og-image.png" />
                <meta property="og:site_name" content="Extremadura Stats" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Estadísticas del C. D. Extremadura | Extremadura Stats" />
                <meta name="twitter:description" content="Bienvenido a Extremadura Stats, con estadísticas completas del C. D. Extremadura. Explora partidos, jugadores, clasificaciones y palmarés del club azulgrana." />
                <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
                <meta name="twitter:image" content="https://extremadurastats.es/og-image.png" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@graph": [
                            {
                                "@type": "WebPage",
                                "@id": "https://extremadurastats.es/#webpage",
                                "url": "https://extremadurastats.es",
                                "name": "Estadísticas del C. D. Extremadura | Extremadura Stats",
                                "description": "Bienvenido a Extremadura Stats, con estadísticas completas del C. D. Extremadura. Explora partidos, jugadores, clasificaciones y palmarés del club azulgrana.",
                                "publisher": {
                                    "@type": "Organization",
                                    "@id": "https://extremadurastats.es/#organization",
                                    "name": "Extremadura Stats",
                                    "url": "https://extremadurastats.es"
                                },
                                "inLanguage": "es-ES"
                            },
                            {
                                "@type": "WebSite",
                                "@id": "https://extremadurastats.es/#website",
                                "url": "https://extremadurastats.es",
                                "name": "Extremadura Stats",
                                "description": "Archivo histórico y estadísticas del C. D. Extremadura"
                            },
                            {
                                "@type": "Organization",
                                "@id": "https://extremadurastats.es/#organization",
                                "name": "Extremadura Stats",
                                "url": "https://extremadurastats.es"
                            },
                            {
                                "@type": "SportsTeam",
                                "@id": "https://extremadurastats.es/#team",
                                "name": "C. D. Extremadura",
                                "sport": "Soccer",
                                "logo": "https://extremadurastats.es/og-image.png",
                                "url": "https://extremadurastats.es"
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
                    const maximoGoleador = datos?.jugadores?.[0] ?? null;
                    const posicionPrincipal = maximoGoleador?.posiciones?.find(pos => pos.es_posicion_principal === true) || null;

                    const partidos = datos?.partidosHoy ?? [];
                    const statsGen = [
                        { label: 'Partidos Jugados', val: datos?.estadisticasGenerales?.partidos_jugados || 0, color: 'text-primary' },
                        { label: 'Victorias', val: datos?.estadisticasGenerales?.partidos_ganados || 0, color: 'text-green-600' },
                        { label: 'Empates', val: datos?.estadisticasGenerales?.partidos_empatados || 0, color: 'text-orange-500' },
                        { label: 'Derrotas', val: datos?.estadisticasGenerales?.partidos_perdidos || 0, color: 'text-red-600' }
                    ]
                    const titulosAscensos = [
                        { label: 'títulos', val: datos?.estadisticasGenerales?.total_titulos || 0 },
                        { label: 'ascensos', val: datos?.estadisticasGenerales?.total_ascensos || 0 }
                    ]

                    return (
                        <div className="max-w-7xl mx-auto px-lg py-xl space-y-20">

                            <section className="relative overflow-hidden rounded-4xl bg-secondary py-20 px-lg text-center shadow-2xl">

                                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
                                </div>

                                <div className="relative z-10 space-y-md">
                                    <h1 className="font-display-xl text-white text-6xl md:text-8xl uppercase tracking-tighter leading-none">
                                        La historia en <br /><span className="text-primary-container">tus manos</span>
                                    </h1>
                                    <p className="text-white/80 font-body-lg max-w-2xl mx-auto text-lg md:text-xl">
                                        Explora el archivo estadístico del C. D. Extremadura.
                                        Partidos, jugadores y récords de la entidad azulgrana.
                                    </p>
                                    <div className="pt-md">
                                        <NavLink to="/temporadas">
                                            <button className="bg-white text-secondary px-xl py-md rounded-full font-bold uppercase tracking-wider hover:bg-primary-container transition-all shadow-lg flex items-center gap-sm mx-auto cursor-pointer">
                                                Explorar Temporadas <BsChevronRight aria-hidden="true" />
                                            </button>
                                        </NavLink>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-lg">
                                <div className="flex items-center gap-md border-b border-outline-variant pb-md">
                                    <div className="p-sm bg-primary/10 rounded-xl text-primary">
                                        <BsCalendar3 size="1.8rem" aria-hidden="true" />
                                    </div>
                                    <h2 className="font-display-xl text-3xl uppercase tracking-tighter">Tal día como hoy</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                                    {partidos.length > 0 && partidos.map((p) => {

                                        const { fechaTexto, horaTexto } = formatearFecha(p.fecha);

                                        return (
                                            <div key={p.id} className="bg-surface border border-outline-variant rounded-2xl p-lg hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-center mb-md">
                                                    <span className="text-xs font-bold px-3 py-1 bg-surface-variant rounded-full text-gray-500 uppercase">
                                                        {fechaTexto} - {horaTexto}
                                                    </span>
                                                    <span className="text-xs text-primary font-bold uppercase tracking-widest italic">
                                                        {p.competicion_temporada_rel.competicion_rel.nombre}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-around gap-md">
                                                    <div className="text-center w-1/3">
                                                        <div className="font-display-xl text-xl uppercase">
                                                            {p.equipo_local_rel.nombre_corto}
                                                        </div>
                                                    </div>
                                                    <div className="text-4xl font-display-xl text-secondary px-md">
                                                        {p.goles_local}
                                                        {p.penaltis_local !== null && ` (${p.penaltis_local})`}
                                                        {' - '}
                                                        {p.penaltis_visitantes !== null && `(${p.penaltis_visitantes}) `}
                                                        {p.goles_visitante}
                                                    </div>
                                                    <div className="text-center w-1/3">
                                                        <div className="font-display-xl text-xl uppercase">
                                                            {p.equipo_visitante_rel.nombre_corto}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='text-center'>
                                                    <VerPartido partido_id={p.id} />
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {partidos.length === 0 && (
                                        <div className="flex items-center justify-center border-2 border-dashed border-outline-variant rounded-2xl p-lg opacity-50">
                                            <p className="text-sm italic">No hay partidos jugados tal día como hoy</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">

                                {maximoGoleador && (
                                    <div className="lg:col-span-5 bg-surface border-2 border-secondary rounded-3xl overflow-hidden shadow-xl">
                                        <div className="bg-secondary p-md flex items-center gap-md text-white">
                                            <BsPersonBadge size="1.5rem" aria-hidden="true" />
                                            <h3 className="font-bold uppercase tracking-tight">Máximo goleador histórico</h3>
                                        </div>
                                        <Link to={`/jugador/${maximoGoleador.jugador_id}`} className="p-xl text-center space-y-md">
                                            <FotoJugador jugador={maximoGoleador} />
                                            <div>
                                                <div className="font-display-xl text-3xl uppercase tracking-tighter text-secondary">
                                                    {maximoGoleador.nombre_corto || `${maximoGoleador.nombre} ${maximoGoleador.apellidos.split(" ")[0]}`}
                                                </div>
                                                {posicionPrincipal && (
                                                    <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">{posicionPrincipal.nombre}</div>
                                                )}
                                            </div>
                                            <div className="pt-md border-t border-outline-variant grid grid-cols-2">
                                                <div>
                                                    <div className="text-4xl font-display-xl text-secondary">{maximoGoleador.goles}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase">Goles</div>
                                                </div>
                                                <div className="border-l border-outline-variant">
                                                    <div className="text-4xl font-display-xl text-secondary">{maximoGoleador.partidos_jugados}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase">Partidos</div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                )}

                                <div className={`${maximoGoleador ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-lg`}>
                                    <div className="flex items-center gap-md">
                                        <BsGraphUp className="text-primary" size="1.5rem" aria-hidden="true" />
                                        <h3 className="font-display-xl text-3xl uppercase tracking-tighter">Balance del Club</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-md">
                                        {statsGen.map((stat) => (
                                            <StatCard key={stat.label} {...stat} />
                                        ))}
                                    </div>

                                    <div className="bg-primary p-lg rounded-2xl text-white flex flex-col md:flex-row items-center justify-around shadow-lg">
                                        {titulosAscensos.map((item, i) => (
                                            <React.Fragment key={item.label}>
                                                {i > 0 && <div className="w-20 h-px my-4 md:w-px md:h-10 md:my-0 bg-white/20" />}
                                                <LogrosCard {...item} />
                                            </React.Fragment>
                                        ))}
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
};

export default Home;