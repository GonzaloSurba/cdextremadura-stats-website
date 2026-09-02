/*
 * ExtremaduraStats
 * Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import FootballCard from '../components/Icons/FootballCard';
import FootballSecondCard from '../components/Icons/FootballSecondCard';

export default function Tarjeta({ tipo }) {
    if (tipo === 'amarilla') {
        return (
            <FootballCard width={24} height={24} fillcard={'yellow'} />
        )
    }
    if (tipo === 'doble_amarilla') {
        return (
            <div className='flex'>
                <FootballSecondCard width={24} height={24} fillcard={'yellow'} />
            </div>
        )
    }
    if (tipo === 'roja') {
        return (
            <FootballCard width={24} height={24} fillcard={'red'} />
        )
    }
}