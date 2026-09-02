/*
 * ExtremaduraStats
 * Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { CircleFlag } from 'react-circle-flags'

const PAIS_A_CODIGO = {
    "españa": "es",
    "portugal": "pt",
    "francia": "fr",
    "italia": "it",
    "alemania": "de",
    "reino unido": "en",
    "argentina": "ar",
    "brasil": "br",
    "colombia": "co",
    "uruguay": "uy",
    "senegal": "sn",
    "marruecos": "ma",
    "ghana": "gh",
    "dinamarca": "dk",
    "montenegro": "me"
};

export default function CountryFlag ({ pais }) {
    const code = PAIS_A_CODIGO[pais?.toLowerCase()]
    return(
        <CircleFlag countryCode={code} width="20" height="20" />
    )
}