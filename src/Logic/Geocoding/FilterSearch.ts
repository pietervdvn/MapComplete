import { ImmutableStore, Store } from "../UIEventSource"
import GeocodingProvider, { GeocodingOptions, SearchResult } from "./GeocodingProvider"
import { SpecialVisualizationState } from "../../UI/SpecialVisualization"
import { Utils } from "../../Utils"
import Locale from "../../UI/i18n/Locale"

export default class FilterSearch implements GeocodingProvider {
    private readonly _state: SpecialVisualizationState

    constructor(state: SpecialVisualizationState) {
        this._state = state

    }

    async search(query: string, options?: GeocodingOptions): Promise<SearchResult[]> {
        return this.searchDirectly(query)
    }

    private searchDirectly(query: string): SearchResult[] {
        const possibleFilters: SearchResult[] = []
        if (query.length === 0) {
            return []
        }
        if(!Utils.isEmoji(query)){
            query = Utils.simplifyStringForSearch(query)
        }
        for (const layer of this._state.layout.layers) {
            if (!Array.isArray(layer.filters)) {
                continue
            }
            for (const filter of layer.filters ?? []) {
                for (let i = 0; i < filter.options.length; i++) {
                    const option = filter.options[i]
                    if (option === undefined) {
                        continue
                    }
                    let terms = ([option.question.txt,
                        ...(option.searchTerms?.[Locale.language.data] ?? option.searchTerms?.["en"] ?? [])]
                        .flatMap(term => [term, ...term?.split(" ")]))
                    terms = terms.map(t => Utils.simplifyStringForSearch(t))
                    terms.push(option.emoji)
                    Utils.NoNullInplace(terms)
                    const levehnsteinD = Math.min(...
                        terms.map(entry => Utils.levenshteinDistance(query, entry.slice(0, query.length))))
                    if (levehnsteinD / query.length > 0.25) {
                        continue
                    }
                    possibleFilters.push({
                        payload: { option, layer, filter, index: i },
                        category: "filter",
                        osm_id: layer.id + "/" + filter.id + "/" + option.osmTags?.asHumanString() ?? "none",
                    })
                }
            }
        }
        return possibleFilters
    }

    suggest(query: string, options?: GeocodingOptions): Store<SearchResult[]> {
        if (Utils.isEmoji(query)) {
            return new ImmutableStore(this.searchDirectly(query))
        }
        query = Utils.simplifyStringForSearch(query)
        return new ImmutableStore(this.searchDirectly(query))
    }


}
