import GeocodingProvider, { GeocodingOptions, SearchResult } from "./GeocodingProvider"
import * as themeOverview from "../../assets/generated/theme_overview.json"
import { MinimalLayoutInformation } from "../../Models/ThemeConfig/LayoutConfig"
import { SpecialVisualizationState } from "../../UI/SpecialVisualization"
import MoreScreen from "../../UI/BigComponents/MoreScreen"
import { ImmutableStore, Store } from "../UIEventSource"

export default class ThemeSearch implements GeocodingProvider {

    private static allThemes: MinimalLayoutInformation[] = (themeOverview["default"] ?? themeOverview)
    private readonly _state: SpecialVisualizationState
    private readonly _knownHiddenThemes: Store<Set<string>>
    private readonly _suggestionLimit: number
    private readonly _layersToIgnore: string[]
    private readonly _otherThemes: MinimalLayoutInformation[]

    constructor(state: SpecialVisualizationState, suggestionLimit: number) {
        this._state = state
        this._layersToIgnore = state.layout.layers.map(l => l.id)
        this._suggestionLimit = suggestionLimit
        this._knownHiddenThemes = MoreScreen.knownHiddenThemes(this._state.osmConnection)
        this._otherThemes = MoreScreen.officialThemes.themes
            .filter(th => th.id !== state.layout.id)
    }

    async search(query: string): Promise<SearchResult[]> {
        return this.searchWrapped(query, 99)
    }

    suggest(query: string, options?: GeocodingOptions): Store<SearchResult[]> {
        return new ImmutableStore(this.searchWrapped(query, this._suggestionLimit ?? 4))
    }


    private searchWrapped(query: string, limit: number): SearchResult[] {
        return this.searchDirect(query, limit).map(match => <SearchResult>{
            payload: match,
            category: "theme",
            osm_id: match.id
        })
    }

    public searchDirect(query: string, limit: number): MinimalLayoutInformation[] {
        if (query.length < 1) {
            return []
        }
        const sorted = MoreScreen.sortedByLowest(query, this._otherThemes, this._layersToIgnore)
        console.log(">>>", sorted)
        return sorted
            .filter(sorted => sorted.lowest < 2)
            .map(th => th.theme)
            .filter(th => !th.hideFromOverview || this._knownHiddenThemes.data.has(th.id))
            .slice(0, limit)
    }


}
