/*
 * ExtremaduraStats
 * Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { HelmetData, HelmetProvider } from 'react-helmet-async'
import App from './App'

export function render(url) {
    const helmetData = new HelmetData({})

    const html = renderToString(
        <HelmetProvider context={helmetData}>
            <StaticRouter location={url}>
                <App />
            </StaticRouter>
        </HelmetProvider>
    )

    const { helmet } = helmetData.context
    return { html, helmet }
}