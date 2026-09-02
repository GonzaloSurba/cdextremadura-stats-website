/*
 * ExtremaduraStats
 * Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import React from 'react';
import { BsEnvelopeAt, BsInfoCircle } from "react-icons/bs";
import { Helmet } from 'react-helmet-async';

export default function Contacto() {
    const fuentes = [
        { name: "Wikipedia", url: "https://es.wikipedia.org" },
        { name: "RFEF", url: "https://www.rfef.es" },
        { name: "FexFútbol", url: "https://www.fexfutbol.com" },
        { name: "BeSoccer", url: "https://es.besoccer.com" },
        { name: "Transfermarkt", url: "https://www.transfermarkt.es" },
        { name: "BDFutbol", url: "https://www.bdfutbol.com" },
        { name: "LaPreferente", url: "https://www.lapreferente.com" },
        { name: "Web oficial del club", url: "https://cdextremadura.es" },
    ];

    return (
        <>
            <Helmet>
                <title>Contacto e información del proyecto | Extremadura Stats</title>
                <link rel="canonical" href="https://extremadurastats.es/contacto" />
                <meta name="description" content="Contacta con Extremadura Stats para avisar de errores, aportar datos históricos o preguntar sobre el C. D. Extremadura. Fuentes y créditos del proyecto." />
                <meta property="og:type" content="website" />
                <meta property="og:locale" content="es_ES" />
                <meta property="og:title" content="Contacto e información del proyecto | Extremadura Stats" />
                <meta property="og:description" content="Contacta con Extremadura Stats para avisar de errores, aportar datos históricos o preguntar sobre el C. D. Extremadura. Fuentes y créditos del proyecto." />
                <meta property="og:url" content="https://extremadurastats.es/contacto" />
                <meta property="og:image" content="https://extremadurastats.es/og-image.png" />
                <meta property="og:site_name" content="Extremadura Stats" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Contacto e información del proyecto | Extremadura Stats" />
                <meta name="twitter:description" content="Contacta con Extremadura Stats para avisar de errores, aportar datos históricos o preguntar sobre el C. D. Extremadura. Fuentes y créditos del proyecto." />
                <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
                <meta name="twitter:image" content="https://extremadurastats.es/og-image.png" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@graph": [
                            {
                                "@type": "WebPage",
                                "@id": "https://extremadurastats.es/contacto/#webpage",
                                "url": "https://extremadurastats.es/contacto",
                                "name": "Contacto - Extremadura Stats",
                                "description": "Información de contacto para comunicarse con Extremadura Stats.",
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
                                    { "@type": "ListItem", "position": 2, "name": "Contacto", "item": "https://extremadurastats.es/contacto" }
                                ]
                            }
                        ]
                    })}
                </script>
            </Helmet>

            <div className="max-w-5xl mx-auto px-lg py-xl space-y-xl">

                <section className="bg-surface border border-outline-variant rounded-2xl p-xl shadow-sm">
                    <div className="flex items-center gap-md mb-md">
                        <BsInfoCircle aria-hidden="true" className="text-secondary" size="2rem" />
                        <h1 className="font-display-xl text-secondary uppercase tracking-tighter">Acerca del Proyecto</h1>
                    </div>
                    <div className="space-y-md text-on-surface-variant font-body-md max-w-3xl">
                        <p>
                            <strong>Extremadura Stats</strong> nace como una iniciativa independiente y sin ánimo de lucro para preservar
                            y difundir la historia estadística del <strong>C. D. Extremadura</strong>.
                        </p>
                        <p>
                            El objetivo es centralizar datos precisos sobre partidos, jugadores y temporadas, rindiendo homenaje
                            a la trayectoria del club y facilitando el acceso a la información para toda la afición azulgrana.
                        </p>
                        <p>
                            Muchos os preguntaréis: ¿Por qué solo datos del C. D. Extremadura y no de sus antecesores?
                            Centralizar la información histórica del C. F. Extremadura y el Extremadura U. D. requiere
                            un volumen de documentación y esfuerzo que, por ahora, excede el alcance de este proyecto.
                            Mi prioridad es ofrecer datos precisos y verificados. No obstante, el proyecto es colaborativo
                            y estoy abierto a trabajar con cualquier persona interesada en expandir este archivo histórico.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-headline-lg-mobile font-bold text-primary mb-lg uppercase tracking-tight">
                        Fuentes de Información
                    </h2>
                    <p className="text-on-surface-variant mb-md">
                        Este proyecto se nutre de datos recopilados de las siguientes fuentes públicas:
                    </p>
                    <div className="flex flex-wrap gap-sm">
                        {fuentes.map((fuente) => (
                            <a
                                key={fuente.name}
                                href={fuente.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-md py-xs bg-surface-variant/30 border border-outline-variant rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm font-medium hover:bg-primary hover:text-white transition-all"
                            >
                                {fuente.name}
                            </a>
                        ))}
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                    <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-lg">
                        <h3 className="text-lg font-bold text-secondary mb-sm">¿Tienes mejores datos?</h3>
                        <p className="text-on-surface-variant text-sm mb-md">
                            Si detectas algún error estadístico o tienes información histórica que falta en la web,
                            ¡envía un correo electrónico! Ayuda a completar la historia del club.
                        </p>

                        <div className="space-y-md">
                            <a href="mailto:extremadurastats@gmail.com" className="flex items-center gap-md group">
                                <div className="hidden md:block p-sm bg-white rounded-lg shadow-sm border border-outline-variant group-hover:text-primary transition-colors">
                                    <BsEnvelopeAt aria-hidden="true" size="1.2rem" />
                                </div>
                                <span className="text-on-surface font-medium">extremadurastats@gmail.com</span>
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center justify-center border-2 border-dashed border-outline-variant rounded-2xl p-lg text-center">
                        <p className="text-gray-400 italic">
                            Esta web <strong>NO</strong> es oficial.<br />
                            No pertenece al C. D. Extremadura ni sus antecesores.
                        </p>
                    </div>
                </section>

            </div>
        </>
    );
};