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

    constructor(state: SpecialVisualizationState) {
        this._state = state
        this._knownHiddenThemes = MoreScreen.knownHiddenThemes(this._state.osmConnection)
    }

    async search(query: string, options?: GeocodingOptions): Promise<SearchResult[]> {
        return this.searchDirect(query, options)
    }

    suggest(query: string, options?: GeocodingOptions): Store<SearchResult[]> {
        return new ImmutableStore(this.searchDirect(query, options))
    }

    private searchDirect(query: string, options?: GeocodingOptions): SearchResult[] {
        if(query.length < 1){
            return []
        }
        const limit = options?.limit ?? 4
        query = Utils.simplifyStringForSearch(query)
        const withMatch = ThemeSearch.allThemes
            .filter(th => !th.hideFromOverview || this._knownHiddenThemes.data.has(th.id))
            .filter(th => th.id !== this._state.layout.id)
            .filter(th => MoreScreen.MatchesLayout(th, query))
            .slice(0, limit + 1)

        return withMatch.map(match => <SearchResult> {
            payload: match,
            category: "theme",
            osm_id: match.id
        })
    }


}
