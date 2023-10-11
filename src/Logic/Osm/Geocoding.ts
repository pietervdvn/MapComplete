import { Utils } from "../../Utils"
import { BBox } from "../BBox"
import Constants from "../../Models/Constants"

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
    public static readonly host = Constants.nominatimEndpoint

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
