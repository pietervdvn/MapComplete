import { Utils } from "../../Utils"
import { BBox } from "../BBox"
import Constants from "../../Models/Constants"
import { FeatureCollection } from "geojson"

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
        const url = `${
            Geocoding.host
        }search?format=json&limit=1&viewbox=${b.getEast()},${b.getNorth()},${b.getWest()},${b.getSouth()}&accept-language=nl&q=${query}`
        return Utils.downloadJson(url)
    }

    static async reverse(
        coordinate: { lon: number; lat: number },
        zoom: number = 17,
        language?: string
    ): Promise<FeatureCollection> {
        // https://nominatim.org/release-docs/develop/api/Reverse/
        // IF the zoom is low, it'll only return a country instead of an address
        const url = `${Geocoding.host}reverse?format=geojson&lat=${coordinate.lat}&lon=${
            coordinate.lon
        }&zoom=${Math.ceil(zoom) + 1}&accept-language=${language}`
        return Utils.downloadJson(url)
    }
}
