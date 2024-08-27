import GeocodingProvider, { SearchResult, GeocodingOptions } from "./GeocodingProvider"
import * as themeOverview from "../../assets/generated/theme_overview.json"
import { MinimalLayoutInformation } from "../../Models/ThemeConfig/LayoutConfig"
import { SpecialVisualizationState } from "../../UI/SpecialVisualization"
import { Utils } from "../../Utils"
import MoreScreen from "../../UI/BigComponents/MoreScreen"
import { ImmutableStore, Store } from "../UIEventSource"

export default class ThemeSearch implements GeocodingProvider {

    private static allThemes: MinimalLayoutInformation[] = (themeOverview["default"] ?? themeOverview)
    private readonly _state: SpecialVisualizationState
    private readonly _knownHiddenThemes: Store<Set<string>>
    private readonly _suggestionLimit: number

    constructor(state: SpecialVisualizationState, suggestionLimit: number) {
        this._state = state
        this._suggestionLimit = suggestionLimit
        this._knownHiddenThemes = MoreScreen.knownHiddenThemes(this._state.osmConnection)
    }

    async search(query: string): Promise<SearchResult[]> {
        return this.searchDirect(query, 99)
    }

    suggest(query: string, options?: GeocodingOptions): Store<SearchResult[]> {
        return new ImmutableStore(this.searchDirect(query, this._suggestionLimit ?? 4))
    }

    private searchDirect(query: string, limit: number): SearchResult[] {
        if(query.length < 1){
            return []
        }
        query = Utils.simplifyStringForSearch(query)
        const withMatch = ThemeSearch.allThemes
            .filter(th => !th.hideFromOverview || this._knownHiddenThemes.data.has(th.id))
            .filter(th => th.id !== this._state.layout.id)
            .filter(th => MoreScreen.MatchesLayout(th, query))
            .slice(0, limit)
        console.log("Matched", withMatch, limit)

        return withMatch.map(match => <SearchResult> {
            payload: match,
            category: "theme",
            osm_id: match.id
        })
    }


}
