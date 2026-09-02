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
import { Link } from 'react-router-dom';
import { entrenadoresApi } from '../services/api';
import Loader from '../components/Loader/Loader';
import CountryFlag from '../components/CountryFlag';
import { BsSearch, BsSortDown, BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { Helmet } from 'react-helmet-async';
import FotoEntrenador from '../components/FotoJugador';

const ELEMENTOS_POR_PAGINA = 9;

export default function Entrenadores() {
    const [entrenadores, setEntrenadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [busqueda, setBusqueda] = useState('');
    const [criterioOrden, setCriterioOrden] = useState('partidos');
    const [paginaActual, setPaginaActual] = useState(1);

    useEffect(() => {
        const cargar = async () => {
            try {
                setLoading(true);
                const data = await entrenadoresApi.listHistorico();
                setEntrenadores(data);
            } catch (err) {
                console.error("Error cargando entrenadores:", err);
                setError("No se pudieron cargar los entrenadores");
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda, criterioOrden]);

    const entrenadoresFiltradosYOrdenados = useMemo(() => (
        entrenadores
            .filter(e => {
                const nombreCompleto = `${e.nombre} ${e.apellidos} ${e.nombre_conocido || ''}`.toLowerCase();
                return nombreCompleto.includes(busqueda.toLowerCase());
            })
            .sort((a, b) => {
                if (criterioOrden === 'partidos') return (b.total_partidos || 0) - (a.total_partidos || 0);
                if (criterioOrden === 'victorias') return (b.total_victorias || 0) - (a.total_victorias || 0);
                if (criterioOrden === 'temporadas') return (b.total_temporadas || 0) - (a.total_temporadas || 0);
                return 0;
            })
    ), [entrenadores, busqueda, criterioOrden]);

    const totalEntrenadores = entrenadoresFiltradosYOrdenados.length;
    const totalPaginas = Math.ceil(totalEntrenadores / ELEMENTOS_POR_PAGINA) || 1;

    const indiceUltimo = paginaActual * ELEMENTOS_POR_PAGINA;
    const indicePrimero = indiceUltimo - ELEMENTOS_POR_PAGINA;
    const entrenadoresPagina = entrenadoresFiltradosYOrdenados.slice(indicePrimero, indiceUltimo);

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
                <title>Entrenadores del C. D. Extremadura | Extremadura Stats</title>
                <link rel="canonical" href="https://extremadurastats.es/entrenadores" />
                <meta name="description" content="Explora el historial de todos los entrenadores que han dirigido al C. D. Extremadura. Partidos, victorias, derrotas y trayectoria completa de cada técnico." />
                <meta property="og:type" content="website" />
                <meta property="og:locale" content="es_ES" />
                <meta property="og:title" content="Entrenadores del C. D. Extremadura | Extremadura Stats" />
                <meta property="og:description" content="Explora el historial de todos los entrenadores que han dirigido al C. D. Extremadura. Partidos, victorias, derrotas y trayectoria completa de cada técnico." />
                <meta property="og:url" content="https://extremadurastats.es/entrenadores" />
                <meta property="og:image" content="https://extremadurastats.es/og-image.png" />
                <meta property="og:site_name" content="Extremadura Stats" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Entrenadores del C. D. Extremadura | Extremadura Stats" />
                <meta name="twitter:description" content="Explora el historial de todos los entrenadores que han dirigido al C. D. Extremadura. Partidos, victorias, derrotas y trayectoria completa de cada técnico." />
                <meta name="twitter:image" content="https://extremadurastats.es/og-image.png" />
                <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@graph": [
                            {
                                "@type": "WebPage",
                                "@id": "https://extremadurastats.es/entrenadores/#webpage",
                                "url": "https://extremadurastats.es/entrenadores",
                                "name": "Entrenadores del C. D. Extremadura - Extremadura Stats",
                                "description": "Historial de entrenadores que han dirigido al C. D. Extremadura.",
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
                                    { "@type": "ListItem", "position": 2, "name": "Entrenadores", "item": "https://extremadurastats.es/entrenadores" }
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
                <div className="max-w-6xl mx-auto px-lg py-xl space-y-xl">

                    <div className="border-b border-outline-variant pb-lg">
                        <h1 className="font-display-xl text-4xl uppercase tracking-tighter text-secondary">
                            Entrenadores
                        </h1>
                        <p className="text-on-surface-variant">Todos los técnicos que han dirigido al club</p>
                    </div>

                    <div className="bg-surface border border-outline-variant rounded-3xl p-lg grid grid-cols-1 md:grid-cols-2 gap-md items-end shadow-sm">

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
                                placeholder="Ej: Juan..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full bg-surface-variant/20 border border-outline-variant/60 rounded-xl px-md py-sm text-sm focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>

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
                                <option value="partidos">Partidos dirigidos</option>
                                <option value="victorias">Victorias</option>
                                <option value="temporadas">Temporadas en el club</option>
                            </select>
                        </div>

                    </div>

                    <p className="text-xs text-gray-500 font-medium">
                        Mostrando del <span className="text-secondary font-bold">{totalEntrenadores === 0 ? 0 : indicePrimero + 1}</span> al{' '}
                        <span className="text-secondary font-bold">{Math.min(indiceUltimo, totalEntrenadores)}</span> de{' '}
                        <span className="text-secondary font-bold">{totalEntrenadores}</span> entrenadores
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
                        {entrenadoresPagina.map((entrenador) => {
                            const nombreMostrar = entrenador.nombre_conocido || `${entrenador.nombre} ${entrenador.apellidos.split(' ')[0]}`;
                            const winRate = entrenador.total_partidos > 0
                                ? Math.round((entrenador.total_victorias / entrenador.total_partidos) * 100)
                                : 0;

                            return (
                                <Link
                                    key={entrenador.id}
                                    to={`/entrenador/${entrenador.id}`}
                                    className="bg-surface border border-outline-variant rounded-3xl p-lg flex flex-col justify-between hover:border-primary/40 hover:shadow-sm transition-all group"
                                >
                                    <div className="flex items-center gap-md">
                                        <FotoEntrenador jugador={entrenador} size={64} />
                                        <div className="min-w-0 flex-1">
                                            <div className="font-display-xl text-lg uppercase tracking-tight text-secondary group-hover:text-primary transition-colors truncate">
                                                {nombreMostrar}
                                            </div>
                                            <div className="flex items-center gap-xs mt-0.5">
                                                {entrenador.nacionalidad && <CountryFlag pais={entrenador.nacionalidad} />}
                                                <span className="text-xs text-gray-500 truncate">
                                                    {entrenador.localidad_nacimiento ? `${entrenador.localidad_nacimiento}, ` : ''}{entrenador.nacionalidad}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-5 gap-xs text-center mt-xl pt-md border-t border-outline-variant/50">

                                        <div className="flex flex-col">
                                            <span className={`font-display-xl text-lg ${criterioOrden === 'partidos' ? 'text-primary' : 'text-secondary'}`}>
                                                {entrenador.total_partidos || 0}
                                            </span>
                                            <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Partidos</span>
                                        </div>

                                        <div className="flex flex-col">
                                            <span className={`font-display-xl text-lg ${criterioOrden === 'victorias' ? 'text-primary' : 'text-green-600'}`}>
                                                {entrenador.total_victorias || 0}
                                            </span>
                                            <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Ganados</span>
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="font-display-xl text-lg text-yellow-500">
                                                {entrenador.total_empates || 0}
                                            </span>
                                            <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Empatados</span>
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="font-display-xl text-lg text-red-500">
                                                {entrenador.total_derrotas || 0}
                                            </span>
                                            <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Perdidos</span>
                                        </div>

                                        <div className="flex flex-col">
                                            <span className={`font-display-xl text-lg ${criterioOrden === 'temporadas' ? 'text-primary' : 'text-secondary'}`}>
                                                {entrenador.total_temporadas || 0}
                                            </span>
                                            <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider" aria-label="Temporadas">
                                                Temp.
                                            </span>
                                        </div>

                                    </div>

                                    <div className="mt-md pt-md border-t border-outline-variant/30">
                                        <div className="flex items-center gap-sm">
                                            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Ratio de victorias</span>
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 rounded-full transition-all"
                                                    style={{ width: `${winRate}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-gray-500">{winRate}%</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {entrenadoresFiltradosYOrdenados.length === 0 && (
                        <div className="text-center py-xl bg-surface border border-dashed border-outline-variant rounded-3xl text-gray-500 italic" role="status">
                            No hay ningún entrenador que coincida con los criterios de búsqueda seleccionados.
                        </div>
                    )}

                    {totalEntrenadores > ELEMENTOS_POR_PAGINA && (
                        <div className="flex items-center justify-center gap-xs pt-xl border-t border-outline-variant/60">
                            <button
                                onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                                disabled={paginaActual === 1}
                                aria-label="Página anterior"
                                className="p-md rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary border border-outline-variant bg-surface text-secondary hover:bg-surface-variant/20 disabled:opacity-40 disabled:hover:bg-surface transition-colors cursor-pointer disabled:cursor-not-allowed"
                            >
                                <BsChevronLeft size="0.9rem" aria-hidden="true" />
                            </button>

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
            )}
        </>
    );
}