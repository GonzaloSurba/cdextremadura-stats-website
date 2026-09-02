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

export default function PoliticaPrivacidad() {
    return (
        <>
            <Helmet>
                <title>Política de privacidad y datos | Extremadura Stats</title>
                <link rel="canonical" href="https://extremadurastats.es/politica-privacidad" />
                <meta name="description" content="Revisa la política de privacidad de Extremadura Stats. Infórmate sobre cómo tratamos los datos personales, tus derechos RGPD y la protección de tu información." />
                <meta property="og:type" content="website" />
                <meta property="og:locale" content="es_ES" />
                <meta property="og:title" content="Política de privacidad y datos | Extremadura Stats" />
                <meta property="og:description" content="Revisa la política de privacidad de Extremadura Stats. Infórmate sobre cómo tratamos los datos personales, tus derechos RGPD y la protección de tu información." />
                <meta property="og:url" content="https://extremadurastats.es/politica-privacidad" />
                <meta property="og:image" content="https://extremadurastats.es/og-image.png" />
                <meta property="og:site_name" content="Extremadura Stats" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Política de privacidad y datos | Extremadura Stats" />
                <meta name="twitter:description" content="Revisa la política de privacidad de Extremadura Stats. Infórmate sobre cómo tratamos los datos personales, tus derechos RGPD y la protección de tu información." />
                <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
                <meta name="twitter:image" content="https://extremadurastats.es/og-image.png" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@graph": [
                            {
                                "@type": "WebPage",
                                "@id": "https://extremadurastats.es/politica-privacidad/#webpage",
                                "url": "https://extremadurastats.es/politica-privacidad",
                                "name": "Política de privacidad - Extremadura Stats",
                                "description": "Política de privacidad del portal estadístico no oficial Extremadura Stats.",
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
                                    { "@type": "ListItem", "position": 2, "name": "Política de privacidad", "item": "https://extremadurastats.es/politica-privacidad" }
                                ]
                            }
                        ]
                    })}
                </script>
            </Helmet>

            <div className="max-w-4xl mx-auto px-lg py-xl text-on-surface">
                <h1 className="font-display-xl text-secondary mb-md uppercase tracking-tighter">Política de Privacidad</h1>

                <section className="space-y-md">
                    <h2 className="text-headline-lg-mobile font-bold text-primary">Información Básica</h2>
                    <div className="overflow-x-auto border border-outline-variant rounded-lg">
                        <table className="w-full text-left border-collapse">
                            <tbody className="text-on-surface-variant">
                                <tr className="border-b border-outline-variant">
                                    <td className="p-md font-bold bg-surface-variant/50 w-1/3">Responsable</td>
                                    <td className="p-md">Extremadura Stats</td>
                                </tr>
                                <tr className="border-b border-outline-variant">
                                    <td className="p-md font-bold bg-surface-variant/50">Finalidad</td>
                                    <td className="p-md">Responder a consultas de usuarios y mejorar la experiencia estadística.</td>
                                </tr>
                                <tr className="border-b border-outline-variant">
                                    <td className="p-md font-bold bg-surface-variant/50">Legitimación</td>
                                    <td className="p-md">Consentimiento del interesado.</td>
                                </tr>
                                <tr>
                                    <td className="p-md font-bold bg-surface-variant/50">Derechos</td>
                                    <td className="p-md">Acceso, rectificación, supresión y otros derechos explicados abajo.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h2 className="text-headline-lg-mobile font-bold text-primary">¿Qué datos recogemos?</h2>
                    <p className="font-body-md text-on-surface-variant">
                        Este sitio web no requiere registro. Solo se recogen datos de forma activa si el usuario contacta
                        vía email (nombre y dirección de correo). De forma pasiva, se pueden recoger cookies o almacenamiento local
                        exclusivamente para el correcto funcionamiento de la página.
                    </p>

                    <h2 className="text-headline-lg-mobile font-bold text-primary">Tus Derechos</h2>
                    <p className="font-body-md text-on-surface-variant">
                        Cualquier persona tiene derecho a obtener confirmación sobre si estamos tratando datos personales que les
                        conciernan. Puedes ejercer tus derechos de acceso o rectificación enviando un correo a
                        <strong> extremadurastats@gmail.com</strong>.
                    </p>

                    <h2 className="text-headline-lg-mobile font-bold text-primary">Tratamiento de datos de figuras públicas</h2>
                    <p className="font-body-md text-on-surface-variant">
                        Los datos relativos a futbolistas y personal técnico mostrados en Extremadura Stats han sido obtenidos de
                        fuentes accesibles al público y se muestran con fines estrictamente informativos, estadísticos y de archivo histórico deportivo.

                        Este tratamiento se realiza conforme al Interés Legítimo (Art. 6.1.f del RGPD). En cumplimiento de la Ley Orgánica 1/1982,
                        se hace uso de la imagen de los profesionales en el ejercicio de su cargo público y con fines informativos.

                        Si usted es una de las personas que aparece en nuestra base de datos y desea ejercer sus derechos de acceso, rectificación o supresión,
                        puede contactarnos en: <strong>extremadurastats@gmail.com</strong>.
                    </p>
                </section>
            </div>
        </>
    );
};