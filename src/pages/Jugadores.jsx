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
import { jugadoresApi } from '../services/api';
import Loader from '../components/Loader/Loader';
import CountryFlag from '../components/CountryFlag';
import { BsSearch, BsSortDown, BsFilter, BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { IoLocationOutline } from "react-icons/io5";
import { Link } from 'react-router-dom';
import FotoJugador from '../components/FotoJugador';
import { Helmet } from 'react-helmet-async';

const ELEMENTOS_POR_PAGINA = 9;

export default function JugadoresHistoricos() {
    const [jugadores, setJugadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [busqueda, setBusqueda] = useState('');
    const [filtroPais, setFiltroPais] = useState('');
    const [filtroLocalidad, setFiltroLocalidad] = useState('');
    const [criterioOrden, setCriterioOrden] = useState('partidos'); // partidos, goles, asistencias, tarjetas, temporadas

    const [paginaActual, setPaginaActual] = useState(1);

    useEffect(() => {
        const cargar = async () => {
            try {
                setLoading(true);
                const data = await jugadoresApi.listHistorico();
                setJugadores(data);
            } catch (err) {
                console.error("Error cargando jugadores:", err);
                setError("No se pudieron cargar los jugadores");
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda, filtroPais, filtroLocalidad, criterioOrden]);

    const jugadoresFiltradosYOrdenados = useMemo(() => (
        jugadores
            .filter(j => {
                const nombreCompleto = `${j.nombre} ${j.apellidos} ${j.nombre_conocido || ''}`.toLowerCase();
                const cumpleNombre = nombreCompleto.includes(busqueda.toLowerCase());

                const cumplePais = filtroPais === '' ||
                    j.nacionalidad?.toLowerCase() === filtroPais.toLowerCase();

                const cumpleLocalidad = filtroLocalidad === '' ||
                    j.localidad_nacimiento?.toLowerCase().includes(filtroLocalidad.toLowerCase());

                return cumpleNombre && cumplePais && cumpleLocalidad;
            })
            .sort((a, b) => {
                // Evaluamos según el criterio seleccionado (De mayor a menor)
                if (criterioOrden === 'partidos') return (b.total_partidos || 0) - (a.total_partidos || 0);
                if (criterioOrden === 'goles') return (b.total_goles || 0) - (a.total_goles || 0);
                if (criterioOrden === 'asistencias') return (b.total_asistencias || 0) - (a.total_asistencias || 0);
                if (criterioOrden === 'tarjetas') return (b.total_tarjetas || 0) - (a.total_tarjetas || 0);
                if (criterioOrden === 'temporadas') return (b.total_temporadas || 0) - (a.total_temporadas || 0);
                return 0;
            })
    ), [jugadores, busqueda, filtroPais, filtroLocalidad, criterioOrden]);

    const totalJugadores = jugadoresFiltradosYOrdenados.length;
    const totalPaginas = Math.ceil(totalJugadores / ELEMENTOS_POR_PAGINA) || 1;

    const indiceUltimoElemento = paginaActual * ELEMENTOS_POR_PAGINA;
    const indicePrimerElemento = indiceUltimoElemento - ELEMENTOS_POR_PAGINA;

    // Este es el array recortado que se usará para renderizar las tarjetas
    const jugadoresPaginaActual = jugadoresFiltradosYOrdenados.slice(indicePrimerElemento, indiceUltimoElemento);

    // Extraemos países únicos para rellenar el selector de filtro dinámicamente
    const paisesUnicos = useMemo(
        () => [...new Set(jugadores.map(j => j.nacionalidad).filter(Boolean))].sort(),
        [jugadores]
    );

    const paginas = useMemo(() =>
        Array.from({ length: totalPaginas }, (_, i) => i + 1)
            .filter(num => num === 1 || num === totalPaginas || Math.abs(num - paginaActual) <= 2)
            .reduce((acc, num, i, arr) => {
                if (i > 0 && num - arr[i - 1] > 1) acc.push(`ellipsis-${num}`);
                acc.push(num);
                return acc;
            }, []), [totalPaginas, paginaActual]);

    return (
        <>
            <Helmet>
                <title>Jugadores del C. D. Extremadura | Extremadura Stats</title>
                <link rel="canonical" href="https://extremadurastats.es/jugadores" />
                <meta name="description" content="Explora el archivo histórico de todos y cada uno de los futbolistas del C. D. Extremadura. Goles, partidos, asistencias y trayectoria completa de cada jugador." />
                <meta property="og:type" content="website" />
                <meta property="og:locale" content="es_ES" />
                <meta property="og:title" content="Jugadores del C. D. Extremadura | Extremadura Stats" />
                <meta property="og:description" content="Explora el archivo histórico de todos y cada uno de los futbolistas del C. D. Extremadura. Goles, partidos, asistencias y trayectoria completa de cada jugador." />
                <meta property="og:url" content="https://extremadurastats.es/jugadores" />
                <meta property="og:image" content="https://extremadurastats.es/og-image.png" />
                <meta property="og:site_name" content="Extremadura Stats" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Jugadores del C. D. Extremadura | Extremadura Stats" />
                <meta name="twitter:description" content="Explora el archivo histórico de todos y cada uno de los futbolistas del C. D. Extremadura. Goles, partidos, asistencias y trayectoria completa de cada jugador." />
                <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
                <meta name="twitter:image" content="https://extremadurastats.es/og-image.png" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@graph": [
                            {
                                "@type": "WebPage",
                                "@id": "https://extremadurastats.es/jugadores/#webpage",
                                "url": "https://extremadurastats.es/jugadores",
                                "name": "Histórico de jugadores - Extremadura Stats",
                                "description": "Lista de jugadores que han pasado por el C. D. Extremadura.",
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
                                    { "@type": "ListItem", "position": 2, "name": "Jugadores", "item": "https://extremadurastats.es/jugadores" }
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
                        <div className="max-w-6xl mx-auto px-lg py-xl space-y-xl">

                            {/* CABECERA */}
                            <div className="border-b border-outline-variant pb-lg">
                                <h1 className="font-display-xl text-4xl uppercase tracking-tighter text-secondary">
                                    Histórico de Jugadores
                                </h1>
                                <p className="text-on-surface-variant">Todos los futbolistas que han defendido nuestra camiseta</p>
                            </div>

                            {/* PANEL DE CONTROL: FILTROS Y ORDENACIÓN */}
                            <div className="bg-surface border border-outline-variant rounded-3xl p-lg grid grid-cols-1 md:grid-cols-4 gap-md items-end shadow-sm">

                                {/* Filtro 1: Nombre */}
                                <div className="space-y-xs">
                                    <label
                                        htmlFor="filtro-nombre"
                                        className="text-[11px] font-bold uppercase text-gray-600 tracking-wider flex items-center gap-xs"
                                    >
                                        <BsSearch aria-hidden="true" /> Buscar por nombre
                                    </label>
                                    <input
                                        id="filtro-nombre"
                                        type="text"
                                        placeholder="Ej: Leandro..."
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                        className="w-full bg-surface-variant/20 border border-outline-variant/60 rounded-xl px-md py-sm text-sm focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>

                                {/* Filtro 2: País */}
                                <div className="space-y-xs">
                                    <label
                                        htmlFor="filtro-pais"
                                        className="text-[11px] font-bold uppercase text-gray-600 tracking-wider flex items-center gap-xs"
                                    >
                                        <BsFilter aria-hidden="true" /> País
                                    </label>
                                    <select
                                        id="filtro-pais"
                                        value={filtroPais}
                                        onChange={(e) => setFiltroPais(e.target.value)}
                                        className="w-full bg-surface-variant/20 border border-outline-variant/60 rounded-xl px-md py-sm text-sm focus:outline-none focus:border-primary transition-colors h-9.5"
                                    >
                                        <option value="">Todos los países</option>
                                        {paisesUnicos.map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filtro 3: Localidad */}
                                <div className="space-y-xs">
                                    <label
                                        htmlFor="filtro-localidad"
                                        className="text-[11px] font-bold uppercase text-gray-600 tracking-wider flex items-center gap-xs"
                                    >
                                        <BsFilter aria-hidden="true" /> Localidad natal
                                    </label>
                                    <input
                                        id="filtro-localidad"
                                        type="text"
                                        placeholder="Ej: Almendralejo..."
                                        value={filtroLocalidad}
                                        onChange={(e) => setFiltroLocalidad(e.target.value)}
                                        className="w-full bg-surface-variant/20 border border-outline-variant/60 rounded-xl px-md py-sm text-sm focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>

                                {/* Ordenación */}
                                <div className="space-y-xs">
                                    <label
                                        htmlFor="filtro-ordenacion"
                                        className="text-[11px] font-bold uppercase text-gray-600 tracking-wider flex items-center gap-xs"
                                    >
                                        <BsSortDown aria-hidden="true" /> Ordenar por
                                    </label>
                                    <select
                                        id="filtro-ordenacion"
                                        value={criterioOrden}
                                        onChange={(e) => setCriterioOrden(e.target.value)}
                                        className="w-full bg-surface-variant/20 border border-outline-variant/60 rounded-xl px-md py-sm text-sm font-bold text-secondary focus:outline-none focus:border-primary transition-colors h-9.5"
                                    >
                                        <option value="partidos">Partidos jugados</option>
                                        <option value="goles">Goles marcados</option>
                                        <option value="asistencias">Asistencias</option>
                                        <option value="tarjetas">Tarjetas recibidas</option>
                                        <option value="temporadas">Temporadas en el club</option>
                                    </select>
                                </div>

                            </div>

                            {/* CONTADOR DE RESULTADOS */}
                            <p className="text-xs text-gray-500 font-medium">
                                Mostrando del <span className="text-secondary font-bold">{totalJugadores === 0 ? 0 : indicePrimerElemento + 1}</span> al{' '}
                                <span className="text-secondary font-bold">{Math.min(indiceUltimoElemento, totalJugadores)}</span> de{' '}
                                <span className="text-secondary font-bold">{totalJugadores}</span> jugadores
                            </p>

                            {/* LISTA / CUADRÍCULA DE TARJETAS DE JUGADORES */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
                                {jugadoresPaginaActual.map((jugador) => {
                                    const nombreMostrar = jugador.nombre_conocido || `${jugador.nombre} ${jugador.apellidos.split(' ')[0]}`;

                                    return (
                                        <Link key={jugador.id} to={`/jugador/${jugador.id}`}
                                            className="bg-surface border border-outline-variant rounded-3xl p-lg flex flex-col justify-between hover:border-primary/40 hover:shadow-sm transition-all group cursor-pointer"
                                        >
                                            {/* Bloque Superior: Identidad */}
                                            <div className="flex items-center gap-md">
                                                <FotoJugador jugador={jugador} size={64} />
                                                <div className="min-w-0 flex-1">
                                                    <h2 className="font-display-xl text-lg uppercase tracking-tight text-secondary group-hover:text-primary transition-colors truncate">
                                                        {nombreMostrar}
                                                    </h2>
                                                    <div className="flex flex-col gap-xs mt-0.5">
                                                        <span className="flex items-center gap-xs text-xs text-gray-500 truncate" aria-label='Localidad natal'>
                                                            <IoLocationOutline size={20} />
                                                            {jugador.localidad_nacimiento ? jugador.pais_nacimiento
                                                                ? `${jugador.localidad_nacimiento}, ${jugador.pais_nacimiento}`
                                                                : jugador.localidad_nacimiento
                                                                : 'Desconocida'}
                                                        </span>
                                                        {jugador.nacionalidad && (
                                                            <span className="flex items-center text-xs gap-xs text-gray-500 truncate" aria-label='Nacionalidad'>
                                                                <CountryFlag pais={jugador.nacionalidad} />
                                                                {jugador.nacionalidad}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bloque Inferior: Estadísticas destacadas estilo Ficha */}
                                            <div className="grid grid-cols-4 gap-xs text-center mt-xl pt-md border-t border-outline-variant/50">

                                                <div className="flex flex-col">
                                                    <span className={`font-display-xl text-lg ${criterioOrden === 'partidos' ? 'text-primary' : 'text-secondary'}`}>
                                                        {jugador.total_partidos || 0}
                                                    </span>
                                                    <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Partidos</span>
                                                </div>

                                                <div className="flex flex-col">
                                                    <span className={`font-display-xl text-lg ${criterioOrden === 'goles' ? 'text-primary' : 'text-secondary'}`}>
                                                        {jugador.total_goles || 0}
                                                    </span>
                                                    <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Goles</span>
                                                </div>

                                                <div className="flex flex-col">
                                                    <span className={`font-display-xl text-lg ${criterioOrden === 'asistencias' ? 'text-primary' : 'text-secondary'}`}>
                                                        {jugador.total_asistencias || 0}
                                                    </span>
                                                    <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Asist.</span>
                                                </div>

                                                <div className="flex flex-col">
                                                    <span className={`font-display-xl text-lg ${criterioOrden === 'temporadas' ? 'text-primary' : 'text-secondary'}`}>
                                                        {jugador.total_temporadas || 0}
                                                    </span>
                                                    <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Temp.</span>
                                                </div>

                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                            {jugadoresFiltradosYOrdenados.length === 0 && (
                                <div className="text-center py-xl bg-surface border border-dashed border-outline-variant rounded-3xl text-gray-500 italic" role="status">
                                    No hay ningún jugador que coincida con los criterios de búsqueda seleccionados.
                                </div>
                            )}

                            {totalJugadores > ELEMENTOS_POR_PAGINA && (
                                <div className="flex items-center justify-center gap-xs pt-xl border-t border-outline-variant/60">
                                    {/* Botón Anterior */}
                                    <button
                                        onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                                        disabled={paginaActual === 1}
                                        aria-label="Página anterior"
                                        className="p-md rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary border border-outline-variant bg-surface text-secondary hover:bg-surface-variant/20 disabled:opacity-40 disabled:hover:bg-surface transition-colors cursor-pointer disabled:cursor-not-allowed"
                                    >
                                        <BsChevronLeft size="0.9rem" aria-hidden="true" />
                                    </button>

                                    {/* Números de Página */}
                                    {paginas.map((item) =>
                                        typeof item === 'string'
                                            ? <span key={item} className="px-2 text-gray-500">...</span>
                                            : <button
                                                key={item}
                                                onClick={() => setPaginaActual(item)}
                                                aria-current={paginaActual === item ? 'page' : undefined}
                                                aria-label={`Ir a página ${item}`}
                                                className={`w-10 h-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-xs font-bold font-display-xl transition-colors cursor-pointer ${paginaActual === item
                                                    ? 'bg-primary text-white'
                                                    : 'border border-outline-variant bg-surface text-secondary hover:bg-surface-variant/20'
                                                    }`}
                                            >
                                                {item}
                                            </button>
                                    )}

                                    {/* Botón Siguiente */}
                                    <button
                                        onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                                        disabled={paginaActual === totalPaginas}
                                        aria-label="Página siguiente"
                                        className="p-md rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary border border-outline-variant bg-surface text-secondary hover:bg-surface-variant/20 disabled:opacity-40 disabled:hover:bg-surface transition-colors cursor-pointer disabled:cursor-not-allowed"
                                    >
                                        <BsChevronRight size="0.9rem" aria-hidden="true" />
                                    </button>
                                </div>
                            )}

                        </div>
                    )
                })()
            )
            }
        </>
    );
}