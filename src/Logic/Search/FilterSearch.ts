import { Utils } from "../../Utils"
import Locale from "../../UI/i18n/Locale"
import Constants from "../../Models/Constants"
import FilterConfig, { FilterConfigOption } from "../../Models/ThemeConfig/FilterConfig"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import LayerState from "../State/LayerState"
import ThemeConfig from "../../Models/ThemeConfig/ThemeConfig"

export type FilterSearchResult = { option: FilterConfigOption, filter: FilterConfig, layer: LayerConfig, index: number }


/**
 * Searches matching filters
 */
export default class FilterSearch {
    private readonly _state: {layerState: LayerState, theme: ThemeConfig}

    constructor(state:  {layerState: LayerState, theme: ThemeConfig}) {
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
        for (const layer of this._state.theme.layers) {
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
                    if(option.fields.length > 0){
                        // Filters with a search field are not supported as of now, see #2141
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

    /**
     * Partitions the list of filters in such a way that identically appearing filters will be in the same sublist.
     *
     * Note that this depends on the language and the displayed text. For example, two filters {"en": "A", "nl": "B"} and {"en": "X", "nl": "B"} will be joined for dutch but not for English
     *
     */
    static mergeSemiIdenticalLayers<T extends FilterSearchResult = FilterSearchResult>(filters: ReadonlyArray<T>, language: string):T[][]  {
        const results : Record<string, T[]> = {}
        for (const filter of filters) {
            const txt = filter.option.question.textFor(language)
            if(results[txt]){
                results[txt].push(filter)
            }else{
                results[txt] = [filter]
            }
        }
        return Object.values(results)
    }
}
