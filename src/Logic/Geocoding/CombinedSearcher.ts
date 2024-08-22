import GeocodingProvider, { GeoCodeResult, GeocodingOptions } from "./GeocodingProvider"
import { Utils } from "../../Utils"

export default class CombinedSearcher implements GeocodingProvider {
    private _providers: ReadonlyArray<GeocodingProvider>
    private _providersWithSuggest: ReadonlyArray<GeocodingProvider>

    constructor(...providers: ReadonlyArray<GeocodingProvider>) {
        this._providers = Utils.NoNull(providers)
        this._providersWithSuggest = this._providers.filter(pr => pr.suggest !== undefined)
    }

    /**
     * Merges the geocode-results from various sources.
     * If the same osm-id is mentioned multiple times, only the first result will be kept
     * @param geocoded
     * @private
     */
    private merge(geocoded: GeoCodeResult[][]): GeoCodeResult[]{
        const results : GeoCodeResult[] = []
        const seenIds = new Set<string>()
        for (const geocodedElement of geocoded) {
            for (const entry of geocodedElement) {
                const id = entry.osm_type+ entry.osm_id
                if(seenIds.has(id)){
                    continue
                }
                seenIds.add(id)
                results.push(entry)
            }
        }
        return results
    }

    async search(query: string, options?: GeocodingOptions): Promise<GeoCodeResult[]> {
        const results = await Promise.all(this._providers.map(pr => pr.search(query, options)))
        return this.merge(results)
    }

    async suggest(query: string, options?: GeocodingOptions): Promise<GeoCodeResult[]> {
        const results = await Promise.all(this._providersWithSuggest.map(pr => pr.suggest(query, options)))
        return this.merge(results)
    }
}
