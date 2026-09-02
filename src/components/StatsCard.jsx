/*
 * ExtremaduraStats
 * Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
export default function StatCard({ label, val, color }) {
    return (
        <div className="bg-surface-variant/20 p-lg rounded-2xl border border-outline-variant">
            <div className={`text-5xl font-display-xl ${color}`}>{val}</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-xs">{label}</div>
        </div>
    );
}