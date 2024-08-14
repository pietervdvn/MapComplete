import { BBox } from "../BBox"
import { Feature, FeatureCollection } from "geojson"

export type GeoCodeResult = {
    display_name: string
    feature?: Feature,
    lat: number
    lon: number
    /**
     * Format:
     * [lat, lat, lon, lon]
     */
    boundingbox?: number[]
    osm_type?: "node" | "way" | "relation"
    osm_id?: string
}

export interface GeocodingOptions {
    bbox?: BBox,
    limit?: number
}


export default interface GeocodingProvider {


    search(query: string, options?: GeocodingOptions): Promise<GeoCodeResult[]>

    /**
     * @param query
     * @param options
     */
    suggest?(query: string, options?: GeocodingOptions): Promise<GeoCodeResult[]>
}

export interface ReverseGeocodingProvider {
    reverseSearch(
        coordinate: { lon: number; lat: number },
        zoom: number,
        language?: string
    ): Promise<FeatureCollection> ;
}

