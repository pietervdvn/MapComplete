import { ImmutableStore, Store } from "../UIEventSource"
import GeocodingProvider, { FilterPayload, FilterResult, GeocodingOptions, SearchResult } from "./GeocodingProvider"
import { SpecialVisualizationState } from "../../UI/SpecialVisualization"
import { Utils } from "../../Utils"
import Locale from "../../UI/i18n/Locale"

export default class FilterSearch implements GeocodingProvider {
    private readonly _state: SpecialVisualizationState

    constructor(state: SpecialVisualizationState) {
        this._state = state

    }

    async search(query: string): Promise<SearchResult[]> {
        return this.searchDirectlyWrapped(query)
    }

    private searchDirectlyWrapped(query: string): FilterResult[] {
        return this.searchDirectly(query).map(payload => ({
            payload,
            category: "filter",
            osm_id: payload.layer.id + "/" + payload.filter.id + "/" + payload.option.osmTags?.asHumanString() ?? "none"
        }))
    }

    public searchDirectly(query: string): FilterPayload[] {
        if (query.length === 0) {
            return []
        }
        const queries = query.split(" ").map(query => {
            if (!Utils.isEmoji(query)) {
                return Utils.simplifyStringForSearch(query)
            }
            return query
        }).filter(q => q.length > 0)
        console.log("Queries:",queries)
        const possibleFilters: FilterPayload[] = []
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
                    if (!option.osmTags) {
                        continue
                    }
                    let terms = ([option.question.txt,
                        ...(option.searchTerms?.[Locale.language.data] ?? option.searchTerms?.["en"] ?? [])]
                        .flatMap(term => [term, ...(term?.split(" ") ?? [])]))
                    terms = terms.map(t => Utils.simplifyStringForSearch(t))
                    terms.push(option.emoji)
                    Utils.NoNullInplace(terms)
                    const distances =    queries.flatMap(query => terms.map(entry => {
                        const d = Utils.levenshteinDistance(query, entry.slice(0, query.length))
                        console.log(query,"?  +",terms, "=",d)
                        const dRelative = d / query.length
                        return dRelative
                    }))

                    const levehnsteinD = Math.min(...distances)
                    if (levehnsteinD > 0.25) {
                        continue
                    }
                    possibleFilters.push({ option, layer, filter, index: i })
                }
            }
        }
        return possibleFilters
    }

    suggest(query: string, options?: GeocodingOptions): Store<SearchResult[]> {
        return new ImmutableStore(this.searchDirectlyWrapped(query))
    }


}
