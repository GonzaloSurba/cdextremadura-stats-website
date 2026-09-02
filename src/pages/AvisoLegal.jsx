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
import { Helmet } from 'react-helmet-async';

export default function AvisoLegal() {
    return (
        <>
            <Helmet>
                <title>Aviso legal — Términos y condiciones | Extremadura Stats</title>
                <link rel="canonical" href="https://extremadurastats.es/aviso-legal" />
                <meta name="description" content="Revisa el aviso legal de Extremadura Stats. Términos de uso del portal no oficial del C. D. Extremadura, propiedad intelectual y exclusión de responsabilidad." />
                <meta property="og:type" content="website" />
                <meta property="og:locale" content="es_ES" />
                <meta property="og:title" content="Aviso legal — Términos y condiciones | Extremadura Stats" />
                <meta property="og:description" content="Revisa el aviso legal de Extremadura Stats. Términos de uso del portal no oficial del C. D. Extremadura, propiedad intelectual y exclusión de responsabilidad." />
                <meta property="og:url" content="https://extremadurastats.es/aviso-legal" />
                <meta property="og:image" content="https://extremadurastats.es/og-image.png" />
                <meta property="og:site_name" content="Extremadura Stats" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Aviso legal — Términos y condiciones | Extremadura Stats" />
                <meta name="twitter:description" content="Revisa el aviso legal de Extremadura Stats. Términos de uso del portal no oficial del C. D. Extremadura, propiedad intelectual y exclusión de responsabilidad." />
                <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
                <meta name="twitter:image" content="https://extremadurastats.es/og-image.png" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@graph": [
                            {
                                "@type": "WebPage",
                                "@id": "https://extremadurastats.es/aviso-legal/#webpage",
                                "url": "https://extremadurastats.es/aviso-legal",
                                "name": "Aviso Legal - Extremadura Stats",
                                "description": "Términos y condiciones legales que rigen el uso del portal estadístico no oficial Extremadura Stats.",
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
                                    { "@type": "ListItem", "position": 2, "name": "Aviso legal", "item": "https://extremadurastats.es/aviso-legal" }
                                ]
                            }
                        ]
                    })}
                </script>
            </Helmet>

            <div className="max-w-4xl mx-auto px-lg py-xl text-on-surface">
                <h1 className="font-display-xl text-secondary mb-md uppercase tracking-tighter">Aviso Legal</h1>
                <p className="text-gray-500 mb-lg italic">Última actualización: 4 de junio de 2026</p>

                <section className="space-y-md">
                    <h2 className="text-headline-lg-mobile font-bold text-primary">1. Datos Identificativos</h2>
                    <p className="font-body-md text-on-surface-variant">
                        En cumplimiento con el deber de información recogido en artículo 10 de la Ley 34/2002, de 11 de julio,
                        de Servicios de la Sociedad de la Información y del Comercio Electrónico, se reflejan los siguientes datos:
                    </p>
                    <ul className="list-disc ml-lg space-y-xs text-on-surface-variant">
                        <li><strong>Titular:</strong> Extremadura Stats</li>
                        <li><strong>Email:</strong> extremadurastats@gmail.com</li>
                        <li><strong>Sitio Web:</strong> www.extremadurastats.es</li>
                        <li><strong>Finalidad:</strong> Proyecto informativo y estadístico sobre el C. D. Extremadura.</li>
                    </ul>

                    <h2 className="text-headline-lg-mobile font-bold text-primary">2. Propiedad Intelectual</h2>
                    <p className="font-body-md text-on-surface-variant">
                        Los contenidos de este sitio web, incluyendo textos, gráficos e imágenes, tienen fines informativos.
                        <strong> Extremadura Stats</strong> es un proyecto independiente y no tiene vinculación oficial con el
                        C. D. Extremadura. Los escudos y marcas comerciales pertenecen a sus respectivos propietarios.
                    </p>

                    <h2 className="text-headline-lg-mobile font-bold text-primary">3. Exclusión de Responsabilidad</h2>
                    <p className="font-body-md text-on-surface-variant">
                        El titular no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza
                        que pudieran ocasionar, a título enunciativo: errores u omisiones en los contenidos, o falta de
                        disponibilidad del portal.
                    </p>
                </section>
            </div>
        </>
    );
};