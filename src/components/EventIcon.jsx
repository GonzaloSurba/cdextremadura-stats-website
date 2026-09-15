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
import FoulGoal from '../components/Icons/FoulGoal';
import PenaltiMatchGoal from '../components/Icons/PenaltiMatchGoal';
import Tarjeta from '../components/Tarjeta';

export default function EventIcon({ tipo }) {
    switch (tipo) {
        case "normal":
            return (<FootballBall width={24} height={24} />);
        case "penalti":
            return (<PenaltiMatchGoal width={24} height={24} />);
        case "falta_directa":
            return (<FoulGoal width={24} height={24} />);
        case "propia_puerta":
            return (<FootballBall width={24} height={24} fill={"darkred"} />);
        case "amarilla":
            return (<Tarjeta width={24} height={24} tipo={"amarilla"} />);
        case "roja":
            return (<Tarjeta width={24} height={24} tipo={"roja"} />);
        case "doble_amarilla":
            return (<Tarjeta width={24} height={24} tipo={"doble_amarilla"} />);
        default:
            return (<FootballBall width={24} height={24} />);
    }
}