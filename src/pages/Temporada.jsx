/*
 * ExtremaduraStats
 * Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { BsCalendar3, BsFilter, BsTrophy } from "react-icons/bs";
import { MdQueryStats } from "react-icons/md";
import FootballCard from '../components/Icons/FootballCard';
import ListaPartidos from '../components/ListaPartidos';
import Loader from '../components/Loader/Loader';
import TablaClasificacion from '../components/TablaClasificacion';
import TablaEstadisticas from '../components/TablaEstadisticas';
import { clasificacionApi, competicionesApi, estadisticasJugadoresApi, partidosApi } from '../services/api';

const getNombreCorto = (j) => j.nombre_conocido || `${j.nombre} ${j.apellidos?.split(' ')[0]?.trim() ?? ''}`.trim();

function MensajeError({ mensaje }) {
    return (
        <p className="text-center py-xl text-red-500" role="alert">{mensaje}</p>
    )
}

export default function Temporada() {
    const [temporadas, setTemporadas] = useState([]);
    const [tempSeleccionada, setTempSeleccionada] = useState(null);
    const [compElegida, setCompElegida] = useState(null);
    const [partidos, setPartidos] = useState([]);
    const [clasificacion, setClasificacion] = useState([])
    const [estadisticas, setEstadisticas] = useState([]);
    const [tabActual, setTabActual] = useState("clasificacion");
    const [loadingInicial, setLoadingInicial] = useState(true);
    const [loadingDatos, setLoadingDatos] = useState(true);
    const [errorInicial, setErrorInicial] = useState(null);
    const [errorDatos, setErrorDatos] = useState(null);

    // Cargo la lista de temporadas al inicio
    useEffect(() => {
        const cargarInicial = async () => {
            try {
                const data = await competicionesApi.listTemporadas();
                
                if (data.length === 0) {
                    throw new Error("No se ha obtenido ninguna temporada");
                }

                // Agrupo las competiciones por temporada
                const dictCompsPorTemp = Object.groupBy(data, (comp) => comp?.temporada_rel?.id);
                const listaPorTemporadas = Object.values(dictCompsPorTemp).map((competiciones) => ({
                    temporada: competiciones[0]?.temporada_rel,
                    competiciones
                })).sort((a, b) => (b?.temporada?.fecha_inicio ?? "").localeCompare(a?.temporada?.fecha_inicio ?? ""));
                setTemporadas(listaPorTemporadas);

                // Por defecto selecciono la temporada más reciente
                const { temporada } = listaPorTemporadas[0];
                setTempSeleccionada(temporada.id);
            } catch (err) {
                console.error(err);
                setErrorInicial("Se ha producido un error al cargar las temporadas");
            } finally {
                setLoadingInicial(false);
            }
        };
        cargarInicial();
    }, []);
    
    // Cargo las competiciones de la temporada seleccionada
    const competicionesTemp = useMemo(() => {
        const temporadaSel = temporadas.find(({ temporada }) => temporada?.id === tempSeleccionada);
        return temporadaSel?.competiciones ?? [];
    }, [temporadas, tempSeleccionada]);

    // Compruebo que la competición elegida exista o si no elijo la primera liga o primera competición que encuentre
    const compSeleccionada = useMemo(() => {
        if (competicionesTemp.some((comp) => comp?.id === compElegida)) return compElegida;
        const liga = competicionesTemp.find((comp) => comp?.competicion_rel?.tipo === "liga") ?? competicionesTemp[0];
        return liga?.id ?? "";
    }, [competicionesTemp, compElegida]);

    // Cargo los partidos cada vez que cambie la competición seleccionada
    useEffect(() => {
        if (!compSeleccionada) return;
        let ignore = false; // Con el ignore evito sobrescribir peticiones si se piden varias demasiado rápido

        const cargarDatosTemporada = async () => {
            setLoadingDatos(true);
            setErrorDatos(null);
            try {
                const [dataPartidos, clasificacion, dataEstadisticas] = await Promise.all([
                    partidosApi.list(compSeleccionada),
                    clasificacionApi.getByTemporada(compSeleccionada),
                    estadisticasJugadoresApi.getByFilters({ competicion_temporada_id: compSeleccionada })
                ])
                if (ignore) return;
                setPartidos(dataPartidos);
                setClasificacion(clasificacion);
                setEstadisticas(dataEstadisticas);
            } catch (err) {
                if (!ignore) {
                    console.error(err);
                    setErrorDatos("Se ha producido un error al cargar los datos de la competición");
                }
            } finally {
                if (!ignore) {
                    setLoadingDatos(false);
                }
            }
        };
        cargarDatosTemporada();
        return () => { ignore = true; };
    }, [compSeleccionada]);

    const competicionObj =
        competicionesTemp.find((comp) => comp?.id === compSeleccionada) ?? null;

    const tipoCompeticion = competicionObj?.competicion_rel?.tipo ?? null;

    const tabEfectivo =
        tipoCompeticion !== "liga" && tabActual === "clasificacion" ? "partidos" : tabActual;

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

            {loadingInicial ? <Loader />
                : errorInicial ? <MensajeError mensaje={errorInicial} />
                : <div className="max-w-6xl mx-auto px-lg py-xl space-y-lg overflow-x-hidden">

                    {/* CABECERA Y SELECTOR */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-md border-b border-outline-variant pb-lg">
                        <div className="md:max-w-1/2">
                            <h1 className="font-display-xl text-4xl uppercase tracking-tighter text-secondary wrap-break-word">
                                {competicionObj?.nombre || "Competición no seleccionada"}
                            </h1>
                            <p className="text-on-surface-variant">Resultados y clasificación detallada</p>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm">
                            <div className="flex items-center gap-sm bg-surface border border-outline-variant p-xs rounded-xl shadow-sm min-w-0 md:w-40 focus-within:ring-2 focus-within:ring-primary">
                                <BsFilter className="ml-sm text-gray-400 shrink-0" aria-hidden="true" />
                                <select
                                    id="temporada-select"
                                    aria-label="Seleccionar temporada"
                                    value={tempSeleccionada ?? ""}
                                    onChange={(e) => {
                                        setTempSeleccionada(Number(e.target.value));
                                        setCompElegida(null);
                                    }}
                                    className="bg-transparent font-bold py-sm pr-lg focus:outline-none cursor-pointer min-w-0 w-full truncate"
                                >
                                    {temporadas.map(({temporada}) => (
                                        <option key={temporada?.id} value={temporada?.id}>{temporada?.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-sm bg-surface border border-outline-variant p-xs rounded-xl shadow-sm min-w-0 md:w-96 focus-within:ring-2 focus-within:ring-primary">
                                <BsFilter className="ml-sm text-gray-400 shrink-0" aria-hidden="true" />
                                <select
                                    id="competicion-select"
                                    aria-label="Seleccionar competición"
                                    value={compSeleccionada ?? ""}
                                    onChange={(e) => setCompElegida(Number(e.target.value))}
                                    className="bg-transparent font-bold py-sm pr-lg focus:outline-none cursor-pointer min-w-0 w-full truncate"
                                >
                                    {competicionesTemp.map((comp) => (
                                        <option key={comp?.id} value={comp?.id}>{comp?.competicion_rel?.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* TABS DE NAVEGACIÓN */}
                    <div className="overflow-x-auto">
                        <div className="flex gap-sm p-xs bg-surface-variant/20 rounded-2xl w-fit min-w-max">
                            {tipoCompeticion === "liga" && (
                                <button
                                    type="button"
                                    onClick={() => setTabActual("clasificacion")}
                                    className={`flex items-center gap-sm px-lg py-sm rounded-xl font-bold transition-all cursor-pointer shrink-0 ${tabEfectivo === 'clasificacion' ? 'bg-white shadow-md text-primary' : 'text-gray-500 hover:bg-white/50'}`}
                                >
                                    <BsTrophy aria-hidden="true" /> Clasificación
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setTabActual("partidos")}
                                className={`flex items-center gap-sm px-lg py-sm rounded-xl font-bold transition-all cursor-pointer shrink-0 ${tabEfectivo === 'partidos' ? 'bg-white shadow-md text-primary' : 'text-gray-500 hover:bg-white/50'}`}
                            >
                                <BsCalendar3 aria-hidden="true" /> Partidos
                            </button>
                            <button
                                type="button"
                                onClick={() => setTabActual("stats")}
                                className={`flex items-center gap-sm px-lg py-sm rounded-xl font-bold transition-all cursor-pointer shrink-0 ${tabEfectivo === 'stats' ? 'bg-white shadow-md text-primary' : 'text-gray-500 hover:bg-white/50'}`}
                            >
                                <MdQueryStats aria-hidden="true" /> Estadísticas
                            </button>
                        </div>
                    </div>

                    {loadingDatos ? <Loader />
                        : errorDatos ? <MensajeError mensaje={errorDatos} />
                        : <div className="relative min-h-100">
                            {/* CONTENIDO PRINCIPAL */}
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {tabEfectivo === "clasificacion" && tipoCompeticion === "liga" ? (
                                    <TablaClasificacion clasificacion={clasificacion} />
                                ) : tabEfectivo === "partidos" ? (
                                    <ListaPartidos partidos={partidos} />
                                ) : tabEfectivo === "stats" && (
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
                    }
                </div>
            }

        </>
    );
}