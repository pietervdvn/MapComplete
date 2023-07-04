// SPDX-FileCopyrightText: 2023 MapComplete  <https://mapcomplete.osm.be/>
//
// SPDX-License-Identifier: GPL-3.0-ONLY

import { Utils } from "../../Utils"
import { BBox } from "../BBox"

export interface GeoCodeResult {
    display_name: string
    lat: number
    lon: number
    /**
     * Format:
     * [lat, lat, lon, lon]
     */
    boundingbox: number[]
    osm_type: "node" | "way" | "relation"
    osm_id: string
}

export class Geocoding {
    private static readonly host = "https://nominatim.openstreetmap.org/search?"

    static async Search(query: string, bbox: BBox): Promise<GeoCodeResult[]> {
        const b = bbox ?? BBox.global
        const url =
            Geocoding.host +
            "format=json&limit=1&viewbox=" +
            `${b.getEast()},${b.getNorth()},${b.getWest()},${b.getSouth()}` +
            "&accept-language=nl&q=" +
            query
        return Utils.downloadJson(url)
    }
}
