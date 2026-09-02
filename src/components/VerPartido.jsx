/*
 * ExtremaduraStats
 * Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { Link } from "react-router-dom";

export default function VerPartido({ partido_id }) {
    return (
        <Link to={`/partido/${partido_id}`}>
            <span className="text-[10px] uppercase font-bold text-gray-400">Ver</span>
        </Link>
    )
}