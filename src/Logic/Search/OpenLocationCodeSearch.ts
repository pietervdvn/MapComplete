import { Store, Stores, UIEventSource } from "../UIEventSource"
import GeocodingProvider, {
    GeocodeResult,
    GeocodingOptions,
    ReverseGeocodingProvider,
    ReverseGeocodingResult,
} from "./GeocodingProvider"
import { decode as pluscode_decode } from "pluscodes"

export default class OpenLocationCodeSearch implements GeocodingProvider {

    /**
     * A regex describing all plus-codes
     */
    public static readonly _isPlusCode = /^([2-9CFGHJMPQRVWX]{2}|00){2,4}\+([2-9CFGHJMPQRVWX]{2,3})?$/

    /**
     *
     * OpenLocationCodeSearch.isPlusCode("9FFW84J9+XG") // => true
     * OpenLocationCodeSearch.isPlusCode("9FFW84J9+") // => true
     * OpenLocationCodeSearch.isPlusCode("9AFW84J9+") // => false
     * OpenLocationCodeSearch.isPlusCode("9FFW+") // => true
     * OpenLocationCodeSearch.isPlusCode("9FFW0000+") // => true
     * OpenLocationCodeSearch.isPlusCode("9FFw0000+") // => true
     * OpenLocationCodeSearch.isPlusCode("9FFW000+") // => false
     *
     */
    public static isPlusCode(str: string) {
        return str.toUpperCase().match(this._isPlusCode) !== null
    }

    async search(query: string, options?: GeocodingOptions): Promise<GeocodeResult[]> {
        if (!OpenLocationCodeSearch.isPlusCode(query)) {
            return undefined
        }
        const { latitude, longitude } = pluscode_decode(query)

        return [{
            lon: longitude,
            lat: latitude,
            description: "Open Location Code",
            osm_id: query,
            display_name: query.toUpperCase(),
        }]
    }

    suggest?(query: string, options?: GeocodingOptions): Store<GeocodeResult[]> {
        return Stores.FromPromise(this.search(query, options))
    }

}
