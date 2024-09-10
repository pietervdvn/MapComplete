import { ImmutableStore, Store } from "../UIEventSource"
import GeocodingProvider, { FilterPayload, FilterResult, GeocodingOptions, SearchResult } from "./GeocodingProvider"
import { SpecialVisualizationState } from "../../UI/SpecialVisualization"
import { Utils } from "../../Utils"
import Locale from "../../UI/i18n/Locale"
import Constants from "../../Models/Constants"

/**
 * Searches matching filters
 */
export default class FilterSearch implements GeocodingProvider {
    private readonly _state: SpecialVisualizationState

    constructor(state: SpecialVisualizationState) {
        this._state = state
    }

    async search(query: string): Promise<SearchResult[]> {
        return this.searchDirectly(query)
    }
    public searchDirectly(query: string): FilterResult[] {
        if (query.length === 0) {
            return []
        }
        const queries = query.split(" ").map(query => {
            if (!Utils.isEmoji(query)) {
                return Utils.simplifyStringForSearch(query)
            }
            return query
        }).filter(q => q.length > 0)
        const possibleFilters: FilterResult[] = []
        for (const layer of this._state.layout.layers) {
            if (!Array.isArray(layer.filters)) {
                continue
            }
            if (layer.filterIsSameAs !== undefined) {
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
                    const distances = queries.flatMap(query => terms.map(entry => {
                        const d = Utils.levenshteinDistance(query, entry.slice(0, query.length))
                        const dRelative = d / query.length
                        return dRelative
                    }))

                    const levehnsteinD = Math.min(...distances)
                    if (levehnsteinD > 0.25) {
                        continue
                    }
                    possibleFilters.push(<FilterResult>{
                        category: "filter",
                        osm_id: layer.id + "/" + filter.id + "/" + i,
                        payload: {
                            option, layer, filter, index:
                            i,
                        },
                    })
                }
            }
        }
        return possibleFilters
    }

    suggest(query: string, options?: GeocodingOptions): Store<SearchResult[]> {
        return new ImmutableStore(this.searchDirectly(query))
    }


    /**
     * Create a random list of filters
     */
    getSuggestions(): FilterPayload[] {
        const result: FilterPayload[] = []
        for (const [id, filteredLayer] of this._state.layerState.filteredLayers) {
            if (!Array.isArray(filteredLayer.layerDef.filters)) {
                continue
            }
            if (Constants.priviliged_layers.indexOf(<any> id) >= 0) {
                continue
            }
            for (const filter of filteredLayer.layerDef.filters) {
                const singleFilterResults: FilterPayload[] = []
                for (let i = 0; i < Math.min(filter.options.length, 5); i++) {
                    const option = filter.options[i]
                    if (option.osmTags === undefined) {
                        continue
                    }
                    singleFilterResults.push({
                        option,
                        filter,
                        index: i,
                        layer: filteredLayer.layerDef,
                    })
                }
                Utils.shuffle(singleFilterResults)
                result.push(...singleFilterResults.slice(0, 3))
            }
        }
        Utils.shuffle(result)
        return result.slice(0, 6)
    }
}
