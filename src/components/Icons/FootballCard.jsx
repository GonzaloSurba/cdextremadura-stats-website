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
export default function FootballCard(props) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlSpace="preserve"
            width={800}
            height={800}
            viewBox="0 0 448.885 448.884"
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
            />
            <path d="M166.749 439.178c2.506 6.055 8.352 9.706 14.515 9.706 2.002 0 4.038-.385 5.999-1.198l221.242-91.55c8.011-3.314 11.822-12.495 8.5-20.51L282.139 9.702A15.72 15.72 0 0 0 267.62 0a15.6 15.6 0 0 0-5.995 1.2L40.383 92.752c-8.015 3.312-11.826 12.497-8.502 20.512zM263.38 25.96l128.862 311.41-206.739 85.554L56.641 111.517z" />
        </svg>
    )
}

