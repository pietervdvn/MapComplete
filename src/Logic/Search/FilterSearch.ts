import { SpecialVisualizationState } from "../../UI/SpecialVisualization"
import { Utils } from "../../Utils"
import Locale from "../../UI/i18n/Locale"
import Constants from "../../Models/Constants"
import FilterConfig, { FilterConfigOption } from "../../Models/ThemeConfig/FilterConfig"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import LayerState from "../State/LayerState"
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"

export type FilterSearchResult = { option: FilterConfigOption, filter: FilterConfig, layer: LayerConfig, index: number }


/**
 * Searches matching filters
 */
export default class FilterSearch {
    private readonly _state: {layerState: LayerState, layout: LayoutConfig}

    constructor(state:  {layerState: LayerState, layout: LayoutConfig}) {
        this._state = state
    }

    public search(query: string): FilterSearchResult[] {
        if (query.length === 0) {
            return []
        }
        const queries = query.split(" ").map(query => {
            if (!Utils.isEmoji(query)) {
                return Utils.simplifyStringForSearch(query)
            }
            return query
        }).filter(q => q.length > 0)
        const possibleFilters: FilterSearchResult[] = []
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
                    possibleFilters.push({
                            option, layer, filter, index:
                            i,
                    })
                }
            }
        }
        return possibleFilters
    }

    /**
     * Create a random list of filters
     */
    getSuggestions(): FilterSearchResult[] {
        const result: FilterSearchResult[] = []
        for (const [id, filteredLayer] of this._state.layerState.filteredLayers) {
            if (!Array.isArray(filteredLayer.layerDef.filters)) {
                continue
            }
            if (Constants.priviliged_layers.indexOf(<any> id) >= 0) {
                continue
            }
            for (const filter of filteredLayer.layerDef.filters) {
                const singleFilterResults: FilterSearchResult[] = []
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
