/*
 * ExtremaduraStats
 * Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { TbArrowBigUp } from "react-icons/tb";
import { BsTrophy } from "react-icons/bs";

export default function LogrosCard({ label, val }) {
    return (
        <div className="flex items-center justify-center gap-md">
            {label === "ascensos" ? (
                <TbArrowBigUp size="2rem" className="text-white" aria-hidden="true" />
            ) : (
                <BsTrophy size="2rem" className="text-white" aria-hidden="true" />
            )}
            <div>
                <div className="font-display-xl text-2xl leading-none">{val} {label}</div>
            </div>
        </div>
    );
}