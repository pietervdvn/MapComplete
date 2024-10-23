import { Utils } from "../../Utils"
import { BBox } from "../BBox"
import Constants from "../../Models/Constants"
import { FeatureCollection } from "geojson"
import Locale from "../../UI/i18n/Locale"
import GeocodingProvider, { GeocodingOptions, SearchResult } from "./GeocodingProvider"

export class NominatimGeocoding implements GeocodingProvider {
    private readonly _host
    private readonly limit: number

    constructor(limit: number = 3, host: string = Constants.nominatimEndpoint) {
        this.limit = limit
        this._host = host
    }

    public search(query: string, options?: GeocodingOptions): Promise<SearchResult[]> {
        const b = options?.bbox ?? BBox.global
        const url = `${this._host}search?format=json&limit=${
            this.limit
        }&viewbox=${b.getEast()},${b.getNorth()},${b.getWest()},${b.getSouth()}&accept-language=${
            Locale.language.data
        }&q=${query}`
        return Utils.downloadJson(url)
    }

    async reverseSearch(
        coordinate: { lon: number; lat: number },
        zoom: number = 17,
        language?: string
    ): Promise<FeatureCollection> {
        // https://nominatim.org/release-docs/develop/api/Reverse/
        // IF the zoom is low, it'll only return a country instead of an address
        const url = `${this._host}reverse?format=geojson&lat=${coordinate.lat}&lon=${
            coordinate.lon
        }&zoom=${Math.ceil(zoom) + 1}&accept-language=${language}`
        return Utils.downloadJson(url)
    }
}
