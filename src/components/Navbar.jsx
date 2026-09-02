/*
 * ExtremaduraStats
 * Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import escudo from '../assets/Escudo-CD-Extremadura.webp';
import { BsList, BsX } from "react-icons/bs";

export default function Navbar() {

    const [menuAbierto, setMenuAbierto] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setMenuAbierto(false);
    }, [location]);

    // Bloquear el scroll de la pantalla de fondo cuando el menú está abierto
    useEffect(() => {
        if (menuAbierto) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [menuAbierto]);

    // Estilos comunes para los enlaces activos tanto en desktop como en mobile
    const linkClass = ({ isActive }) => 
        `font-medium transition-colors duration-200 ${isActive ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`;

    return (
        <>
            {/* Menú ordenador */}
            <nav className="bg-surface/80 backdrop-blur-xl w-full top-0 sticky z-50 border-b border-outline-variant shadow-sm hidden md:block">
                <div className="flex justify-between items-center w-full px-lg py-md max-w-container-max mx-auto">
                    <NavLink to="/" className="flex items-center gap-md shrink-0">
                        <div>
                            <img src={escudo} alt="Escudo del Club Deportivo Extremadura" className="w-20 h-auto" loading="lazy" />
                        </div>
                        <div>
                            <div className="font-display-xl text-headline-lg-mobile uppercase tracking-tighter text-secondary">EXTREMADURA STATS</div>
                            <div className="font-body-md text-body-md text-gray-400 font-medium">
                                Estadísticas del C. D. Extremadura
                            </div>
                        </div>
                    </NavLink>
                    <div className="flex items-center gap-lg">
                        <NavLink to="/" className={linkClass}>Inicio</NavLink>
                        <NavLink to="/temporadas" className={linkClass}>Temporadas</NavLink>
                        <NavLink to="/jugadores" className={linkClass}>Jugadores</NavLink>
                        <NavLink to="/entrenadores" className={linkClass}>Entrenadores</NavLink>
                        <NavLink to="/palmares" className={linkClass}>Palmarés</NavLink>
                        <NavLink to="/contacto" className={linkClass}>Contacto</NavLink>
                    </div>
                </div>
            </nav>

            {/* Menú móvil */}
            <nav className="bg-surface/80 backdrop-blur-xl top-0 sticky z-50 border-b border-outline-variant shadow-sm px-md py-sm flex items-center justify-between md:hidden">
                <NavLink to="/" className="flex items-center gap-sm rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <img src={escudo} alt="Escudo del club" className="w-12 h-auto" loading="lazy" />
                    <div>
                        <div className="font-display-xl text-sm uppercase tracking-tighter text-secondary font-bold">EXTREMADURA STATS</div>
                        <div className="text-[10px] text-gray-400">Web no oficial</div>
                    </div>
                </NavLink>

                {/* Botón Hamburguesa */}
                <button
                    onClick={() => setMenuAbierto(!menuAbierto)}
                    aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
                    aria-expanded={menuAbierto}
                    className="p-xs rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    {menuAbierto ? <BsX size="1.6rem" /> : <BsList size="1.6rem" />}
                </button>
            </nav>

            {/* ── 3. MENÚ LATERAL DESPLEGABLE (Móvil) ────────────────────────────── */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${menuAbierto ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setMenuAbierto(false)}
            />

            {/* Panel de Enlaces */}
            <div
                className={`fixed top-0 right-0 h-full w-70 bg-surface z-50 p-xl flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${menuAbierto ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Cabecera del Panel Lateral */}
                <div>
                    <div className="flex justify-end mb-lg">
                        <button
                            onClick={() => setMenuAbierto(false)} aria-label="Cerrar menú"
                            className="p-xs text-secondary hover:text-primary transition-colors"
                        >
                            <BsX size="2rem" />
                        </button>
                    </div>

                    {/* Links de navegación vertical */}
                    <div className="flex flex-col gap-md text-lg">
                        <NavLink to="/" className={linkClass}>Inicio</NavLink>
                        <NavLink to="/temporadas" className={linkClass}>Temporadas</NavLink>
                        <NavLink to="/jugadores" className={linkClass}>Jugadores</NavLink>
                        <NavLink to="/entrenadores" className={linkClass}>Entrenadores</NavLink>
                        <NavLink to="/palmares" className={linkClass}>Palmarés</NavLink>
                        <NavLink to="/contacto" className={linkClass}>Contacto</NavLink>
                    </div>
                </div>
            </div>
        </>
    )

}