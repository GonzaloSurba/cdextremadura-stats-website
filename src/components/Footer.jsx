/*
 * ExtremaduraStats
 * Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { NavLink } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="bg-surface border-t border-outline-variant py-md">
            <div className="max-w-container-max mx-auto px-lg flex justify-between items-center text-on-surface-variant text-sm">
                <p>© 2026 Extremadura Stats. No oficial.</p>
                <div className="flex gap-md">
                    <NavLink to="/politica-privacidad" className="hover:text-primary">Política de privacidad</NavLink>
                    <NavLink to="/aviso-legal" className="hover:text-primary">Aviso legal</NavLink>
                </div>
            </div>
        </footer>
    )
}