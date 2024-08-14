import { Utils } from "../../Utils"
import { BBox } from "../BBox"
import Constants from "../../Models/Constants"
import { FeatureCollection } from "geojson"
import Locale from "../../UI/i18n/Locale"
import GeocodingProvider, { GeoCodeResult, ReverseGeocodingProvider } from "./GeocodingProvider"

export class NominatimGeocoding implements GeocodingProvider, ReverseGeocodingProvider {

    private readonly _host ;

    constructor(host: string =  Constants.nominatimEndpoint) {
        this._host = host
    }

    public async search(query: string, options?: { bbox?: BBox; limit?: number }): Promise<GeoCodeResult[]> {
        const b = options?.bbox ?? BBox.global
        const url = `${
            this._host
        }search?format=json&limit=${options?.limit ?? 1}&viewbox=${b.getEast()},${b.getNorth()},${b.getWest()},${b.getSouth()}&accept-language=${
            Locale.language.data
        }&q=${query}`
        return await Utils.downloadJson(url)
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
