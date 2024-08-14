import GeocodingProvider, { GeoCodeResult, GeocodingOptions } from "./GeocodingProvider"

export default class CombinedSearcher implements GeocodingProvider {
    private _providers: ReadonlyArray<GeocodingProvider>
    private _providersWithSuggest: ReadonlyArray<GeocodingProvider>

    constructor(...providers: ReadonlyArray<GeocodingProvider>) {
        this._providers = providers
        this._providersWithSuggest = providers.filter(pr => pr.suggest !== undefined)
    }

    async search(query: string, options?: GeocodingOptions): Promise<GeoCodeResult[]> {
        const results = await Promise.all(this._providers.map(pr => pr.search(query, options)))
        return results.flatMap(x => x)
    }

    async suggest(query: string, options?: GeocodingOptions): Promise<GeoCodeResult[]> {
        const results = await Promise.all(this._providersWithSuggest.map(pr => pr.suggest(query, options)))
        return results.flatMap(x => x)
    }
}
