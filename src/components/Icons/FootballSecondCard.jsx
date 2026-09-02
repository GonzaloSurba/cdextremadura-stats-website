/*
 * ExtremaduraStats
 * Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import * as React from "react"
export default function FootballSecondCard(props) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlSpace="preserve"
            width={900}
            height={900}
            viewBox="0 0 504.996 504.995"
            aria-hidden={true}
            {...props}
        >
            <path
                d="m46.782 109.158 131.435 325.246 227.784-93.564L271.225 8.91Z"
                style={{
                    display: "inline",
                    fill: `${props.fillcard}`,
                    strokeWidth: 0.561106,
                }}
                transform="translate(39.581 2.936) scale(.9975)"
            />
            <path d="M205.913 441.016c2.5 6.04 8.331 9.682 14.479 9.682a15.6 15.6 0 0 0 5.984-1.195l220.689-91.321c7.99-3.306 11.792-12.464 8.478-20.46L321.015 12.615a15.68 15.68 0 0 0-14.483-9.678 15.561 15.561 0 0 0-5.98 1.197L79.863 95.456c-7.995 3.304-11.796 12.466-8.48 20.46zm96.39-412.185 128.54 310.632-206.223 85.34L96.08 114.174Z" />
            <path
                d="m46.782 109.158 131.435 325.246 227.784-93.564L271.225 8.91Z"
                style={{
                    display: "inline",
                    fill: `${props.fillcard}`,
                    strokeWidth: 0.561106,
                }}
                transform="translate(17.575 53.174)"
            />
            <path d="M184.324 492.352c2.506 6.055 8.352 9.706 14.515 9.706 2.002 0 4.038-.385 5.999-1.198l221.242-91.55c8.011-3.314 11.822-12.495 8.5-20.51L299.714 62.876a15.72 15.72 0 0 0-14.519-9.702 15.6 15.6 0 0 0-5.995 1.2L57.958 145.926c-8.015 3.312-11.826 12.497-8.502 20.512zm96.631-413.218 128.862 311.41-206.739 85.554L74.216 164.691Z" />
        </svg>
    )
}
