/*
 * ExtremaduraStats
 * Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { competicionesApi, partidosApi, clasificacionApi, estadisticasJugadoresApi } from '../services/api';
import Loader from '../components/Loader/Loader';
import ListaPartidos from '../components/ListaPartidos';
import TablaEstadisticas from '../components/TablaEstadisticas';
import TablaClasificacion from '../components/TablaClasificacion';
import { BsTrophy, BsCalendar3, BsFilter } from "react-icons/bs";
import { MdQueryStats } from "react-icons/md";
import FootballCard from '../components/Icons/FootballCard';
import { Helmet } from 'react-helmet-async';

const getNombreCorto = (j) => j.nombre_conocido || `${j.nombre} ${j.apellidos.split(' ')[0] ?? ''}`;

export default function Temporada() {
    const [temporadas, setTemporadas] = useState([]);
    const [tempSeleccionada, setTempSeleccionada] = useState("");
    const [partidos, setPartidos] = useState([]);
    const [clasificacion, setClasificacion] = useState([])
    const [estadisticas, setEstadisticas] = useState([]);
    const [tabActual, setTabActual] = useState("clasificacion");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Cargar la lista de temporadas al inicio
    useEffect(() => {
        const cargarInicial = async () => {
            setLoading(true);
            try {
                const data = await competicionesApi.listTemporadas();
                setTemporadas(data);
                if (data.length > 0) {
                    // Por defecto seleccionamos la más reciente
                    setTempSeleccionada(data[0].id);
                }
            } catch (err) {
                console.error(err);
                setError("Se ha producido un error al cargar las temporadas");
            }
        };
        cargarInicial();
    }, []);

    // 2. Cargar partidos cada vez que cambie la temporada seleccionada
    useEffect(() => {
        if (!tempSeleccionada) return;

        const cargarDatosTemporada = async () => {
            setLoading(true);
            try {
                const [dataPartidos, clasificacion, dataEstadisticas] = await Promise.all([
                    partidosApi.list(tempSeleccionada),
                    clasificacionApi.getByTemporada(tempSeleccionada),
                    estadisticasJugadoresApi.getByFilters({ competicion_temporada_id: tempSeleccionada })
                ])
                setPartidos(dataPartidos);
                setClasificacion(clasificacion);
                setEstadisticas(dataEstadisticas);
            } catch (err) {
                console.error(err);
                setError("Se ha producido un error al cargar las temporadas");
            } finally {
                setLoading(false);
            }
        };
        cargarDatosTemporada();
    }, [tempSeleccionada]);

    const tipoCompeticion = useMemo(() => {
        const temp = temporadas.find(t => t.id === tempSeleccionada);
        return temp?.competicion_rel?.tipo ?? null;
    }, [temporadas, tempSeleccionada]);

    useEffect(() => {
        if (tipoCompeticion === null) return;
        if (tipoCompeticion !== "liga" && tabActual === "clasificacion") {
            setTabActual("partidos");
        }
    }, [tipoCompeticion, tabActual]);

    const statsData = useMemo(() => ({
        goleadores: estadisticas
            .filter(j => j.partidos_jugados > 0 && j.goles > 0)
            .sort((a, b) => b.goles - a.goles)
            .map(j => ({
                nombre: getNombreCorto(j),
                goles: j.goles,
                goles_penalti: j.goles_penalti,
                id: j.jugador_id
            })),

        goleadores_penalti: estadisticas
            .filter(j => j.partidos_jugados > 0 && j.goles_penalti > 0)
            .sort((a, b) => b.goles_penalti - a.goles_penalti)
            .map(j => ({
                nombre: getNombreCorto(j),
                goles_penalti: j.goles_penalti,
                id: j.jugador_id
            })),

        presencias: estadisticas
            .filter(j => j.partidos_jugados > 0)
            .sort((a, b) => b.partidos_jugados - a.partidos_jugados)
            .map(j => ({
                nombre: getNombreCorto(j),
                pj: j.partidos_jugados,
                id: j.jugador_id
            })),

        disciplina: estadisticas
            .filter(j => j.partidos_jugados > 0 && (j.tarjetas_amarillas > 0 || j.tarjetas_rojas > 0))
            .sort((a, b) => (b.tarjetas_amarillas + b.tarjetas_rojas * 3) - (a.tarjetas_amarillas + a.tarjetas_rojas * 3))
            .map(j => ({
                nombre: getNombreCorto(j),
                amarillas: j.tarjetas_amarillas,
                rojas: j.tarjetas_rojas,
                id: j.jugador_id
            })),
    }), [estadisticas]);

    return (
        <>
            <Helmet>
                <title>Histórico de temporadas y competiciones | Extremadura Stats</title>
                <link rel="canonical" href="https://extremadurastats.es/temporadas" />
                <meta name="description" content="Explora el archivo histórico de las temporadas disputadas por el C. D. Extremadura. Resultados, clasificaciones y estadísticas detalladas de cada competición." />
                <meta property="og:type" content="website" />
                <meta property="og:locale" content="es_ES" />
                <meta property="og:title" content="Histórico de temporadas y competiciones | Extremadura Stats" />
                <meta property="og:description" content="Explora el archivo histórico de las temporadas disputadas por el C. D. Extremadura. Resultados, clasificaciones y estadísticas detalladas de cada competición." />
                <meta property="og:url" content="https://extremadurastats.es/temporadas" />
                <meta property="og:image" content="https://extremadurastats.es/og-image.png" />
                <meta property="og:site_name" content="Extremadura Stats" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Histórico de temporadas y competiciones | Extremadura Stats" />
                <meta name="twitter:description" content="Explora el archivo histórico de las temporadas disputadas por el C. D. Extremadura. Resultados, clasificaciones y estadísticas detalladas de cada competición." />
                <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
                <meta name="twitter:image" content="https://extremadurastats.es/og-image.png" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@graph": [
                            {
                                "@type": "WebPage",
                                "@id": "https://extremadurastats.es/temporadas/#webpage",
                                "url": "https://extremadurastats.es/temporadas",
                                "name": "Histórico de temporadas - Extremadura Stats",
                                "description": "Histórico de temporadas del C. D. Extremadura.",
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
                                    { "@type": "ListItem", "position": 2, "name": "Temporadas", "item": "https://extremadurastats.es/temporadas" }
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
                    return (
                        <div className="max-w-6xl mx-auto px-lg py-xl space-y-lg overflow-x-hidden">

                            {/* CABECERA Y SELECTOR */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-md border-b border-outline-variant pb-lg">
                                <div>
                                    <h1 className="font-display-xl text-4xl uppercase tracking-tighter text-secondary wrap-break-word">
                                        {temporadas.find(t => t.id === tempSeleccionada)?.nombre || "Temporada no seleccionada"}
                                    </h1>
                                    <p className="text-on-surface-variant">Resultados y clasificación detallada</p>
                                </div>

                                <div className="flex items-center gap-sm bg-surface border border-outline-variant p-xs rounded-xl shadow-sm min-w-0 focus-within:ring-2 focus-within:ring-primary">
                                    <BsFilter className="ml-sm text-gray-400 shrink-0" aria-hidden="true" />
                                    <select
                                        id="temporada-select"
                                        aria-label="Seleccionar temporada"
                                        value={tempSeleccionada}
                                        onChange={(e) => setTempSeleccionada(Number(e.target.value))}
                                        className="bg-transparent font-bold py-sm pr-lg focus:outline-none cursor-pointer min-w-0 w-full truncate"
                                    >
                                        {temporadas.map(t => (
                                            <option key={t.id} value={t.id}>{t.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* TABS DE NAVEGACIÓN */}
                            <div className="overflow-x-auto">
                                <div className="flex gap-sm p-xs bg-surface-variant/20 rounded-2xl w-fit min-w-max">
                                    {tipoCompeticion === "liga" && (
                                        <button
                                            onClick={() => setTabActual("clasificacion")}
                                            className={`flex items-center gap-sm px-lg py-sm rounded-xl font-bold transition-all cursor-pointer shrink-0 ${tabActual === 'clasificacion' ? 'bg-white shadow-md text-primary' : 'text-gray-500 hover:bg-white/50'}`}
                                        >
                                            <BsTrophy aria-hidden="true" /> Clasificación
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setTabActual("partidos")}
                                        className={`flex items-center gap-sm px-lg py-sm rounded-xl font-bold transition-all cursor-pointer shrink-0 ${tabActual === 'partidos' ? 'bg-white shadow-md text-primary' : 'text-gray-500 hover:bg-white/50'}`}
                                    >
                                        <BsCalendar3 aria-hidden="true" /> Partidos
                                    </button>
                                    <button
                                        onClick={() => setTabActual("stats")}
                                        className={`flex items-center gap-sm px-lg py-sm rounded-xl font-bold transition-all cursor-pointer shrink-0 ${tabActual === 'stats' ? 'bg-white shadow-md text-primary' : 'text-gray-500 hover:bg-white/50'}`}
                                    >
                                        <MdQueryStats aria-hidden="true" /> Estadísticas
                                    </button>
                                </div>
                            </div>

                            {/* CONTENIDO PRINCIPAL */}
                            <div className="relative min-h-100">
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {tabActual === "clasificacion" && tipoCompeticion === "liga" ? (
                                        <TablaClasificacion clasificacion={clasificacion} />
                                    ) : tabActual === "partidos" ? (
                                        <ListaPartidos partidos={partidos} />
                                    ) : tabActual === "stats" && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <TablaEstadisticas
                                                titulo="Máximos goleadores"
                                                columnas={['Jugador', 'Goles', 'Pen']}
                                                datos={statsData.goleadores}
                                            />
                                            <TablaEstadisticas
                                                titulo="Más penaltis marcados"
                                                columnas={['Jugador', 'Goles']}
                                                datos={statsData.goleadores_penalti}
                                            />
                                            <TablaEstadisticas
                                                titulo="Más partidos jugados"
                                                columnas={['Jugador', 'PJ']}
                                                datos={statsData.presencias}
                                            />
                                            <TablaEstadisticas
                                                titulo="Disciplina"
                                                columnas={[
                                                    'Jugador',
                                                    { label: 'Amarillas', icono: <FootballCard width={24} height={24} fillcard={'yellow'} /> },
                                                    { label: 'Rojas', icono: <FootballCard width={24} height={24} fillcard={'red'} /> }
                                                ]}
                                                datos={statsData.disciplina}
                                            />
                                        </div>
                                    )}
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