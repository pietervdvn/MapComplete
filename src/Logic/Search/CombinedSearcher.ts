import GeocodingProvider, {
    GeocodeResult,
    GeocodingOptions,
    SearchResult,
} from "./GeocodingProvider"
import { Utils } from "../../Utils"
import { Store, Stores } from "../UIEventSource"

export default class CombinedSearcher implements GeocodingProvider {
    public readonly name = "CombinedSearcher"
    private _providers: ReadonlyArray<GeocodingProvider>
    private _providersWithSuggest: ReadonlyArray<GeocodingProvider>

    constructor(...providers: ReadonlyArray<GeocodingProvider>) {
        this._providers = Utils.NoNull(providers)
        this._providersWithSuggest = this._providers.filter((pr) => pr.suggest !== undefined)
    }

    /**
     * Merges the geocode-results from various sources.
     * If the same osm-id is mentioned multiple times, only the first result will be kept
     * @param geocoded
     * @private
     */
    public static merge(geocoded: GeocodeResult[][]): GeocodeResult[] {
        const results: GeocodeResult[] = []
        const seenIds = new Set<string>()
        for (const geocodedElement of geocoded) {
            if (geocodedElement === undefined) {
                continue
            }
            for (const entry of geocodedElement) {
                if (entry.osm_id === undefined) {
                    throw "Invalid search result: a search result always must have an osm_id to be able to merge results from different sources"
                }
                const id = (entry["osm_type"] ?? "") + entry.osm_id
                if (seenIds.has(id)) {
                    continue
                }
                seenIds.add(id)
                results.push(entry)
            }
        }
        return results
    }

    async search(query: string, options?: GeocodingOptions): Promise<SearchResult[]> {
        const results = await Promise.all(this._providers.map((pr) => pr.search(query, options)))
        return CombinedSearcher.merge(results)
    }

    suggest(query: string, options?: GeocodingOptions): Store<SearchResult[]> {
        return Stores.concat(
            this._providersWithSuggest.map((pr) => pr.suggest(query, options))
        ).map((gcrss) => CombinedSearcher.merge(gcrss))
    }
}
