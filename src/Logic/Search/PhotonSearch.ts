import Constants from "../../Models/Constants"
import GeocodingProvider, {
    GeocodeResult,
    GeocodingCategory,
    GeocodingOptions,
    GeocodingUtils,
    ReverseGeocodingProvider,
    ReverseGeocodingResult,
} from "./GeocodingProvider"
import { Utils } from "../../Utils"
import { Feature, FeatureCollection } from "geojson"
import Locale from "../../UI/i18n/Locale"
import { GeoOperations } from "../GeoOperations"
import { Store, Stores } from "../UIEventSource"

export default class PhotonSearch implements GeocodingProvider, ReverseGeocodingProvider {
    private readonly _endpoint: string
    private supportedLanguages = ["en", "de", "fr"]
    private static readonly types = {
        R: "relation",
        W: "way",
        N: "node",
    }
    private readonly ignoreBounds: boolean
    private readonly suggestionLimit: number = 5
    private readonly searchLimit: number = 1

    constructor(
        ignoreBounds: boolean = false,
        suggestionLimit: number = 5,
        searchLimit: number = 1,
        endpoint?: string
    ) {
        this.ignoreBounds = ignoreBounds
        this.suggestionLimit = suggestionLimit
        this.searchLimit = searchLimit
        this._endpoint = endpoint ?? Constants.photonEndpoint ?? "https://photon.komoot.io/"
    }

    async reverseSearch(
        coordinate: {
            lon: number
            lat: number
        },
        zoom: number,
        language?: string
    ): Promise<ReverseGeocodingResult[]> {
        const url = `${this._endpoint}/reverse?lon=${coordinate.lon}&lat=${
            coordinate.lat
        }&${this.getLanguage(language)}`
        const result = await Utils.downloadJsonCached<FeatureCollection>(url, 1000 * 60 * 60)
        for (const f of result.features) {
            f.properties.osm_type = PhotonSearch.types[f.properties.osm_type]
        }
        return <ReverseGeocodingResult[]>result.features
    }

    /**
     * Gets a `&lang=en` if the current/requested language is supported
     * @param language
     * @private
     */
    private getLanguage(language?: string): string {
        language ??= Locale.language.data
        if (this.supportedLanguages.indexOf(language) < 0) {
            return ""
        }
        return `&lang=${language}`
    }

    suggest(query: string, options?: GeocodingOptions): Store<GeocodeResult[]> {
        return Stores.FromPromise(this.search(query, options))
    }

    private buildDescription(entry: Feature) {
        const p = entry.properties
        const type = <GeocodingCategory>p.type

        function ifdef(prefix: string, str: string) {
            if (str) {
                return prefix + str
            }
            return ""
        }

        switch (type) {
            case "house": {
                const addr = ifdef("", p.street) + ifdef(" ", p.housenumber)
                if (!addr) {
                    return p.city
                }
                return addr + ifdef(", ", p.city)
            }
            case "coordinate":
            case "street":
                return p.city ?? p.country
            case "city":
            case "locality":
                if (p.state) {
                    return p.state + ifdef(", ", p.country)
                }
                return p.country
            case "country":
                return undefined
        }
    }

    private getCategory(entry: Feature) {
        const p = entry.properties
        if (p.osm_key === "shop") {
            return "shop"
        }
        if (p.osm_value === "train_station" || p.osm_key === "railway") {
            return "train_station"
        }
        if (p.osm_value === "aerodrome" || p.osm_key === "aeroway") {
            return "airport"
        }
        return p.type
    }

    async search(query: string, options?: GeocodingOptions): Promise<GeocodeResult[]> {
        if (query.length < 3) {
            return []
        }
        const limit = this.searchLimit
        let bbox = ""
        if (options?.bbox && !this.ignoreBounds) {
            const [lon, lat] = options.bbox.center()
            bbox = `&lon=${lon}&lat=${lat}`
        }
        const url = `${this._endpoint}/api/?q=${encodeURIComponent(
            query
        )}&limit=${limit}${this.getLanguage()}${bbox}`
        const results = await Utils.downloadJsonCached<FeatureCollection>(url, 1000 * 60 * 60)
        const encoded = results.features.map((f) => {
            const [lon, lat] = GeoOperations.centerpointCoordinates(f)
            let boundingbox: number[] = undefined
            if (f.properties.extent) {
                const [lon0, lat0, lon1, lat1] = f.properties.extent
                boundingbox = [lat0, lat1, lon0, lon1]
            }
            return <GeocodeResult>{
                feature: f,
                osm_id: f.properties.osm_id,
                display_name: f.properties.name,
                description: this.buildDescription(f),
                osm_type: PhotonSearch.types[f.properties.osm_type],
                category: this.getCategory(f),
                boundingbox,
                lon,
                lat,
                source: this._endpoint,
            }
        })
        return GeocodingUtils.mergeSimilarResults(encoded)
    }
}
