/*
 * ExtremaduraStats
 * Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import FootballBall from '../components/Icons/FootballBall';
import Assist from '../components/Icons/Assist';
import FoulGoal from '../components/Icons/FoulGoal';
import PenaltiMatchGoal from '../components/Icons/PenaltiMatchGoal';
import Tarjeta from '../components/Tarjeta';

export default function Leyenda() {
    const ICON_LIST = [
        { id: 'gol', Component: FootballBall, label: 'Gol' },
        { id: 'gol_en_propia', Component: FootballBall, fill: 'darkred', label: 'Gol en propia' },
        { id: 'gol_de_falta', Component: FoulGoal, label: 'Gol de falta' },
        { id: 'gol_de_penalti', Component: PenaltiMatchGoal, label: 'Gol de penalti' },
        { id: 'asistencia', Component: Assist, label: 'Asistencia' },
        { id: 'amarilla', Component: Tarjeta, tipo: 'amarilla', label: 'Tarjeta amarilla' },
        { id: 'segunda_amarilla', Component: Tarjeta, tipo: 'doble_amarilla', label: 'Segunda amarilla' },
        { id: 'roja', Component: Tarjeta, tipo: 'roja', label: 'Roja directa' },
    ];

    return (
        <>
            <h3 className="text-xl font-display-xl uppercase border-b border-outline-variant pb-2">Leyenda</h3>
            <div className="bg-surface border border-outline-variant rounded-3xl p-lg space-y-3 relative flex flex-col md:flex-row gap-2">
                {ICON_LIST.map(icon => (
                    <div key={icon.id} className='m-auto min-w-2/4 md:min-w-16 md:w-16 md:min-h-16 flex flex-row-reverse md:flex-col items-center justify-between gap-1'>
                        <icon.Component width={24} height={24} fill={icon.fill} tipo={icon.tipo} />
                        <p className='text-xs text-center'>{icon.label}</p>
                    </div>
                ))}
            </div>
        </>
    )
}