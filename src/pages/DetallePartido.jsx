/*
 * ExtremaduraStats
 * Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { equiposApi, partidosApi } from '../services/api';
import { eventoTipo, formatearFecha } from '../services/utils';
import Loader from '../components/Loader/Loader';
import FootballBall from '../components/Icons/FootballBall';
import PenaltiGol from '../components/Icons/PenaltiGol';
import PenaltiError from '../components/Icons/PenaltiError';
import Tarjeta from '../components/Tarjeta';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const nombreJugador = (j) =>
    j.nombre_conocido || `${j.nombre} ${j.apellidos.split(' ')[0]}`;

function calcularRondasPenaltis(tanda, ladoPrincipal, ladoRival) {
    if (!tanda?.length) return [];

    const rondasMap = {};

    for (const tiro of tanda) {
        const ronda = Math.ceil(tiro.orden / 2);
        const lado = tiro.a_favor ? ladoPrincipal : ladoRival;

        if (!rondasMap[ronda]) {
            rondasMap[ronda] = { rondaNumero: ronda, local: null, visitante: null };
        }

        rondasMap[ronda][lado] = tiro;
    }

    return Object.values(rondasMap).sort((a, b) => a.rondaNumero - b.rondaNumero);
}

function JugadorAlineacion({ datos }) {
    return (
        <Link to={`/jugador/${datos.jugador}`}>
            {datos.dorsal && (
                <span className="text-gray-500 font-bold">
                    {`${datos.dorsal}. `}
                </span>
            )}
            <span>{
                nombreJugador(datos.jugador_rel)
            }</span>
        </Link>
    )
}

export default function DetallePartido() {
    const { id } = useParams(); // Captura el ID de la URL
    const [partido, setPartido] = useState(null);
    const [equipos, setEquipos] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarPartido = async () => {
            try {
                const data = await partidosApi.get(id);
                const [equipoLocal, equipoVisitante] = await Promise.all([
                    equiposApi.get(data.equipo_local),
                    equiposApi.get(data.equipo_visitante)
                ]);
                setPartido(data);
                setEquipos({
                    "local": equipoLocal,
                    "visitante": equipoVisitante
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        cargarPartido();
    }, [id]);

    const nombreLocal = equipos?.local?.nombre_corto;
    const nombreVisitante = equipos?.visitante?.nombre_corto;

    const estadio = partido?.estadio || partido?.equipo_local_rel?.estadio || '';

    const tituloMeta = nombreLocal && nombreVisitante
        ? `${nombreLocal} - ${nombreVisitante} | Extremadura Stats`
        : "Detalle del partido histórico | Extremadura Stats";

    const descripcionMeta = nombreLocal && nombreVisitante
        ? `Descubre qué pasó en el encuentro entre ${nombreLocal} y ${nombreVisitante}. Alineación, goles, tarjetas y todos los sucesos del partido del C. D. Extremadura.`
        : "Consulta la alineación, los goles, las tarjetas y todos los sucesos del partido del C. D. Extremadura. Datos históricos detallados del encuentro incluyendo sustituciones.";

    const urlCanonical = `https://extremadurastats.es/partido/${id}`;

    /**
     * El Helmet debe cargarse primero, si pongo antes el loading los buscadores solo verian
     * eso y no el Helmet, por eso lo hago así.
     */

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
                                "@type": "SportsEvent",
                                "@id": `https://extremadurastats.es/partido/${id}#event`,
                                "name": `${nombreLocal} vs ${nombreVisitante}`,
                                "startDate": partido?.fecha,
                                "location": { "@type": "Place", "name": estadio },
                                "homeTeam": { "@type": "SportsTeam", "name": nombreLocal },
                                "awayTeam": { "@type": "SportsTeam", "name": nombreVisitante }
                            },
                            {
                                "@type": "BreadcrumbList",
                                "itemListElement": [
                                    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://extremadurastats.es" },
                                    { "@type": "ListItem", "position": 2, "name": "Temporadas", "item": "https://extremadurastats.es/temporadas" },
                                    { "@type": "ListItem", "position": 3, "name": `${partido?.competicion || 'Partido'}`, "item": `https://extremadurastats.es/partido/${id}` }
                                ]
                            }
                        ]
                    })}
                </script>
            </Helmet>

            {loading ? (
                    <Loader />
                ) : !partido ? (
                    <p className='text-center py-xl text-red-500' role="alert">Partido no encontrado</p>
                ) : (
                    (() => {

                        const titulares = partido.alineaciones.filter(a => a.titular);
                        const suplentes = partido.alineaciones.filter(a => !a.titular);

                        // Determina en qué lado de la pantalla va el equipo principal (id=1)
                        const equipoPrincipalEsLocal = partido.equipo_local === 1;
                        const ladoPrincipal = equipoPrincipalEsLocal ? 'local' : 'visitante';
                        const ladoRival = equipoPrincipalEsLocal ? 'visitante' : 'local';

                        const eventos = [
                            ...partido.goles.map(g => ({
                                ...g,
                                tipo_evento: 'gol',
                                lado: g.a_favor ? ladoPrincipal : ladoRival
                            })),
                            ...partido.tarjetas.map(t => ({
                                ...t,
                                tipo_evento: 'tarjeta',
                                lado: ladoPrincipal,
                                anotador_rel: partido.alineaciones.find(a => a.jugador === t.jugador)?.jugador_rel
                            }))
                        ].sort((a, b) => a.minuto - b.minuto);

                        const entrenador = equipoPrincipalEsLocal
                            ? partido.entrenador_local_rel
                            : partido.entrenador_visitante_rel;

                        const { fechaTexto, horaTexto } = formatearFecha(partido.fecha);

                        const nombreLocal = equipos.local.nombre_corto;
                        const nombreVisitante = equipos.visitante.nombre_corto;

                        const rondasPenaltis = calcularRondasPenaltis(partido.tanda_penaltis, ladoPrincipal, ladoRival);

                        return (

                            <div className="max-w-5xl mx-auto p-md space-y-lg">

                                {/* SECCIÓN SUPERIOR: EL MARCADOR (Scoreboard) */}
                                <header className="bg-primary text-white rounded-3xl px-md py-xl md:px-xl shadow-lg text-center">
                                    <p className="text-xs uppercase tracking-widest opacity-80 mb-md">
                                        {partido.competicion} • Jornada {partido.jornada}
                                    </p>
                                    <h1 className="sr-only">
                                        {`${nombreLocal} vs ${nombreVisitante} – ${partido.competicion}, Jornada ${partido.jornada}`}
                                    </h1>
                                    <div className="flex flex-col md:flex-row items-center justify-around gap-md md:gap-0">
                                        <div className="flex-1 w-full md:w-auto">
                                            <h2 className="text-2xl font-bold">{nombreLocal}</h2>
                                        </div>
                                        <div className="flex flex-col items-center px-lg my-sm md:my-0 min-w-35">
                                            <span className="text-4xl md:text-6xl font-display-xl tracking-tighter">
                                                {partido.goles_local} - {partido.goles_visitante}
                                            </span>
                                            {partido.penaltis_local && (
                                                <span className="text-[10px] md:text-xs font-bold text-gray-400 tracking-wider mt-1">
                                                    Penaltis: {partido.penaltis_local} - {partido.penaltis_visitantes}
                                                </span>
                                            )}
                                            <span className="bg-secondary px-3 py-1 rounded-full text-[10px] md:text-xs mt-2 uppercase">
                                                {partido.estado}
                                            </span>
                                        </div>
                                        <div className="flex-1 w-full md:w-auto">
                                            <h2 className="text-2xl font-bold">{nombreVisitante}</h2>
                                        </div>
                                    </div>
                                    <div className="mt-lg pt-lg border-t border-white/10 text-sm opacity-90">
                                        <p>{`${fechaTexto} - ${horaTexto}`}</p>
                                        <p className="font-bold">{estadio}</p>
                                    </div>
                                </header>

                                {/* SECCIÓN INFERIOR: DOS COLUMNAS */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">

                                    {/* COLUMNA IZQUIERDA: CRONOLOGÍA (Timeline) */}
                                    <div className="lg:col-span-2 space-y-md">
                                        <h3 className="text-xl font-display-xl uppercase border-b border-outline-variant pb-2">Sucesos</h3>
                                        <div className="bg-surface border border-outline-variant rounded-3xl p-lg space-y-3 relative">
                                            {/* Línea central vertical */}
                                            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-outline-variant"></div>

                                            {eventos.map((ev, i) => {
                                                const esLocal = ev.lado === 'local';
                                                const nombre = ev.anotador_rel
                                                    ? nombreJugador(ev.anotador_rel)
                                                    : ev.jugador;
                                                const icono = ev.tipo_evento === 'gol' ? <FootballBall width={24} height={24} /> : <Tarjeta tipo={ev.tipo} />;

                                                return (
                                                    <div key={i} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 relative">
                                                        {/* Lado local (izquierda) */}
                                                        {esLocal ? (
                                                            <div className="flex items-center gap-2 justify-end bg-surface-variant/20 p-2 rounded-xl">
                                                                <div className="text-right">
                                                                    <p className="font-bold text-sm leading-tight">{nombre}</p>
                                                                    <p className="text-xs text-gray-500 uppercase">{eventoTipo(ev.tipo)}</p>
                                                                </div>
                                                                <span className="text-lg">{icono}</span>
                                                            </div>
                                                        ) : (
                                                            <div />
                                                        )}

                                                        {/* Minuto central */}
                                                        <div className="z-10 w-9 h-9 rounded-full bg-white border-2 border-primary flex items-center justify-center font-bold text-xs shrink-0">
                                                            {ev.minuto}'
                                                        </div>

                                                        {/* Lado visitante (derecha) */}
                                                        {!esLocal ? (
                                                            <div className="flex items-center gap-2 bg-surface-variant/20 p-2 rounded-xl">
                                                                <span className="text-lg">{icono}</span>
                                                                <div>
                                                                    <p className="font-bold text-sm leading-tight">{nombre}</p>
                                                                    <p className="text-xs text-gray-500 uppercase">{eventoTipo(ev.tipo)}</p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {/* TANDA DE PENALTIS */}
                                        {rondasPenaltis.length > 0 && (
                                            <>
                                                <h3 className="text-xl font-display-xl uppercase border-b border-outline-variant pb-2">
                                                    Tanda de penaltis
                                                </h3>
                                                <div className="bg-surface border border-outline-variant rounded-3xl p-lg">
                                                    <div className="space-y-2">
                                                        {rondasPenaltis.map((ronda) => {
                                                            return (
                                                                <div key={ronda.rondaNumero} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
                                                                    {/* Local */}
                                                                    <div className="flex items-center gap-2 justify-end">
                                                                        {ronda.local ? (
                                                                            <>
                                                                                <span className="font-medium text-right">{nombreJugador(ronda.local.jugador_rel)}</span>
                                                                                <span>
                                                                                    {ronda.local.anotado ?
                                                                                        <PenaltiGol width={24} height={24} fill="green" />
                                                                                        : <PenaltiError width={24} height={24} fill="red" />
                                                                                    }
                                                                                </span>
                                                                            </>
                                                                        ) : <span className="text-gray-300">—</span>}
                                                                    </div>

                                                                    {/* Número de ronda */}
                                                                    <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-xs font-bold shrink-0">
                                                                        {ronda.rondaNumero}
                                                                    </div>

                                                                    {/* Visitante */}
                                                                    <div className="flex items-center gap-2">
                                                                        {ronda.visitante ? (
                                                                            <>
                                                                                <span>
                                                                                    {ronda.visitante.anotado ?
                                                                                        <PenaltiGol width={24} height={24} fill="green" />
                                                                                        : <PenaltiError width={24} height={24} fill="red" />
                                                                                    }
                                                                                </span>
                                                                                <span className="font-medium">{nombreJugador(ronda.visitante.jugador_rel)}</span>
                                                                            </>
                                                                        ) : <span className="text-gray-300">—</span>}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* COLUMNA DERECHA: ALINEACIÓN (Lineup) */}
                                    <div className="space-y-md">
                                        <h3 className="text-xl font-display-xl uppercase border-b border-outline-variant pb-2">Alineación</h3>
                                        <div className="bg-surface border border-outline-variant rounded-3xl p-lg">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Titulares</h4>
                                            <ul className="space-y-3 mb-8">
                                                {titulares.map(a => (
                                                    <li key={a.id} className="flex justify-between text-sm font-medium border-b border-outline-variant/30 pb-1">
                                                        <JugadorAlineacion datos={a} />
                                                        {a.minuto_salida && <span className="text-[10px] text-red-500">↓ {a.minuto_salida}'</span>}
                                                    </li>
                                                ))}
                                            </ul>

                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Suplentes</h4>
                                            <ul className="space-y-3 mb-8">
                                                {suplentes.map(a => (
                                                    <li key={a.id} className="flex justify-between text-sm text-gray-600">
                                                        <JugadorAlineacion datos={a} />
                                                        <div>
                                                            {a.minuto_entrada && <span className="text-[10px] text-green-600 font-bold">↑ {a.minuto_entrada}'</span>}
                                                            {a.minuto_salida && <span className="text-[10px] text-red-500 pl-2">↓ {a.minuto_salida}'</span>}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>

                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Entrenador</h4>
                                            <ul className="space-y-3">
                                                {entrenador ? (
                                                    <li className="flex justify-between text-sm font-medium border-b border-outline-variant/30 pb-1">
                                                        <span>{nombreJugador(entrenador)}</span>
                                                    </li>
                                                ) : (
                                                    <li className="text-sm text-gray-400 italic">No presenta</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>

                                </div>
                            </div>

                        );
                    })()
                )
            }
        </>
    )
}