import { BBox } from "../BBox"
import { Feature, Geometry } from "geojson"
import { DefaultPinIcon } from "../../Models/Constants"

export type GeocodingCategory = "coordinate" | "city" | "house" | "street" | "locality" | "country" | "train_station" | "county" | "airport"

export type GeoCodeResult = {
    /**
     * The name of the feature being displayed
     */
    display_name: string
    /**
     * Some optional, extra information
     */
    description?: string | Promise<string>,
    feature?: Feature,
    lat: number
    lon: number
    /**
     * Format:
     * [lat, lat, lon, lon]
     */
    boundingbox?: number[]
    osm_type?: "node" | "way" | "relation"
    osm_id?: string,
    category?: GeocodingCategory,
    importance?: number
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

export type ReverseGeocodingResult = Feature<Geometry,{
    osm_id: number,
    osm_type: "node" | "way" | "relation",
    country: string,
    city: string,
    countrycode: string,
    type: GeocodingCategory,
    street: string
} >

export interface ReverseGeocodingProvider {
    reverseSearch(
        coordinate: { lon: number; lat: number },
        zoom: number,
        language?: string
    ): Promise<ReverseGeocodingResult[]> ;
}

export class GeocodingUtils {

    public static categoryToZoomLevel: Record<GeocodingCategory, number> = {
        city: 12,
        county: 10,
        coordinate: 16,
        country: 8,
        house: 16,
        locality: 14,
        street: 15,
        train_station: 14,
        airport: 13

    }


    public static categoryToIcon: Record<GeocodingCategory, DefaultPinIcon> = {
        city: "building_office_2",
        coordinate: "globe_alt",
        country: "globe_alt",
        house: "house",
        locality: "building_office_2",
        street: "globe_alt",
        train_station: "train",
        county: "building_office_2",
        airport: "airport"

    }

}

