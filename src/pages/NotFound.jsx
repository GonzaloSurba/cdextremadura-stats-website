/*
 * ExtremaduraStats
 * Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { Helmet } from 'react-helmet-async';
import escudo from '../assets/Escudo-CD-Extremadura.webp';
import { Link } from 'react-router-dom';
import { BsArrowLeft } from 'react-icons/bs';

export default function NotFound() {
    return (
        <>
            <Helmet>
                <title>Error 404 - Página no encontrada | Extremadura Stats</title>
                <meta name="description" content="Error 404" />
                <meta name="robots" content="noindex, follow, max-snippet:-1, max-image-preview:large" />
                <meta property="og:type" content="website" />
                <meta property="og:locale" content="es_ES" />
                <meta property="og:title" content="Error 404 - Página no encontrada | Extremadura Stats" />
                <meta property="og:description" content="Error 404" />
                <meta property="og:image" content="https://extremadurastats.es/og-image.png" />
                <meta property="og:site_name" content="Extremadura Stats" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Error 404 - Página no encontrada | Extremadura Stats" />
                <meta name="twitter:description" content="Error 404" />
                <meta name="twitter:image" content="https://extremadurastats.es/og-image.png" />
            </Helmet>

            <div className="min-h-[70vh] flex flex-col items-center justify-center px-md text-center space-y-xl py-2xl">

                <div className="relative flex items-center justify-center">
                    
                    <div className="absolute w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute w-32 h-32 bg-secondary/10 rounded-full blur-2xl translate-x-4"></div>

                    <img
                        src={escudo}
                        alt="Escudo del Club Deportivo Extremadura"
                        className="w-36 h-auto relative z-10 opacity-20 grayscale contrast-125 select-none pointer-events-none"
                        loading="lazy"
                    />
                </div>

                <div className="space-y-sm">
                    <h1 className="font-display-xl text-7xl md:text-8xl uppercase tracking-tighter text-primary font-black leading-none">
                        404
                    </h1>
                    <h2 className="font-display-xl text-xl md:text-2xl uppercase tracking-tight text-secondary">
                        Página no encontrada
                    </h2>
                    <p className="text-sm text-gray-400 font-medium font-body-md px-sm">
                        El enlace que has seguido puede estar roto, haber cambiado de posición o la temporada a la que intentas acceder aún no se ha jugado.
                    </p>
                </div>

                <div>
                    <Link to="/">
                        <button className="border border-outline-variant bg-surface text-secondary px-xl py-md rounded-full font-bold uppercase text-xs tracking-wider hover:bg-surface-variant/20 hover:border-primary/40 transition-all shadow-sm flex items-center gap-sm mx-auto cursor-pointer group active:scale-95">
                            <BsArrowLeft aria-hidden="true" className="group-hover:-translate-x-1 transition-transform" />
                            Volver al inicio
                        </button>
                    </Link>
                </div>

            </div>
        </>
    )
}