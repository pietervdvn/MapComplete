import GeocodingProvider, { GeoCodeResult, GeocodingOptions } from "./GeocodingProvider"
import * as themeOverview from "../../assets/generated/theme_overview.json"
import { MinimalLayoutInformation } from "../../Models/ThemeConfig/LayoutConfig"
import { SpecialVisualizationState } from "../../UI/SpecialVisualization"
import { Utils } from "../../Utils"
import MoreScreen from "../../UI/BigComponents/MoreScreen"
import { Store } from "../UIEventSource"

export default class ThemeSearch implements GeocodingProvider {

    private static allThemes: MinimalLayoutInformation[] = (themeOverview["default"] ?? themeOverview)
    private readonly _state: SpecialVisualizationState
    private readonly _knownHiddenThemes: Store<Set<string>>

    constructor(state: SpecialVisualizationState) {
        this._state = state
        this._knownHiddenThemes = MoreScreen.knownHiddenThemes(this._state.osmConnection)
    }

    search(query: string, options?: GeocodingOptions): Promise<GeoCodeResult[]> {
        return this.suggest(query, options)
    }

    async suggest?(query: string, options?: GeocodingOptions): Promise<GeoCodeResult[]> {
        if(query.length < 1){
            return []
        }
        const limit = options?.limit ?? 4
        query = Utils.simplifyStringForSearch(query)
        const withMatch = ThemeSearch.allThemes
            .filter(th => !th.hideFromOverview )
            .filter(th => th.id !== this._state.layout.id)
            .filter(th => MoreScreen.MatchesLayout(th, query))
            .slice(0, limit + 1)

        return withMatch.map(match => (<GeoCodeResult> {
            payload: match,
            osm_id: match.id
        }))
    }


}
