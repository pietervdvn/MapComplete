import LayoutConfig, { MinimalLayoutInformation } from "../../Models/ThemeConfig/LayoutConfig"
import { Store } from "../UIEventSource"
import UserRelatedState from "../State/UserRelatedState"
import { Utils } from "../../Utils"
import Locale from "../../UI/i18n/Locale"
import themeOverview from "../../assets/generated/theme_overview.json"
import LayerSearch from "./LayerSearch"
import SearchUtils from "./SearchUtils"
import { OsmConnection } from "../Osm/OsmConnection"


type ThemeSearchScore = {
    theme: MinimalLayoutInformation,
    lowest: number,
    perLayer?: Record<string, number>,
    other: number
}


export default class ThemeSearch {

    public static readonly officialThemes: {
        themes: MinimalLayoutInformation[],
        layers: Record<string, Record<string, string[]>>
    } = <any> themeOverview
    public static readonly officialThemesById: Map<string, MinimalLayoutInformation> = new Map<string, MinimalLayoutInformation>()
    static {
        for (const th of ThemeSearch.officialThemes.themes ?? []) {
            ThemeSearch.officialThemesById.set(th.id, th)
        }
    }


    private readonly _knownHiddenThemes: Store<Set<string>>
    private readonly _layersToIgnore: string[]
    private readonly _otherThemes: MinimalLayoutInformation[]

    constructor(state: {osmConnection: OsmConnection, layout: LayoutConfig}) {
        this._layersToIgnore = state.layout.layers.map(l => l.id)
        this._knownHiddenThemes = UserRelatedState.initDiscoveredHiddenThemes(state.osmConnection).map(list => new Set(list))
        this._otherThemes = ThemeSearch.officialThemes.themes
            .filter(th => th.id !== state.layout.id)
    }


    public search(query: string, limit: number): MinimalLayoutInformation[] {
        if (query.length < 1) {
            return []
        }
        const sorted = ThemeSearch.sortedByLowestScores(query, this._otherThemes, this._layersToIgnore)
        return sorted
            .filter(sorted => sorted.lowest < 2)
            .map(th => th.theme)
            .filter(th => !th.hideFromOverview || this._knownHiddenThemes.data.has(th.id))
            .slice(0, limit)
    }

    public static createUrlFor(
        layout: { id: string },
        state?: { layoutToUse?: { id } },
    ): string {
        if (layout === undefined) {
            return undefined
        }
        if (layout.id === undefined) {
            console.error("ID is undefined for layout", layout)
            return undefined
        }

        if (layout.id === state?.layoutToUse?.id) {
            return undefined
        }

        let path = window.location.pathname
        // Path starts with a '/' and contains everything, e.g. '/dir/dir/page.html'
        path = path.substr(0, path.lastIndexOf("/"))
        // Path will now contain '/dir/dir', or empty string in case of nothing
        if (path === "") {
            path = "."
        }

        let linkPrefix = `${path}/${layout.id.toLowerCase()}.html?`
        if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
            linkPrefix = `${path}/theme.html?layout=${layout.id}&`
        }

        if (layout.id.startsWith("http://") || layout.id.startsWith("https://")) {
            linkPrefix = `${path}/theme.html?userlayout=${layout.id}&`
        }


        return `${linkPrefix}`
    }

    private static scoreThemes(query: string, themes: MinimalLayoutInformation[], ignoreLayers: string[] = []): Record<string, ThemeSearchScore> {
        if (query?.length < 1) {
            return undefined
        }
        themes = Utils.NoNullInplace(themes)
        const layerScores = LayerSearch.scoreLayers(query)
        for (const ignoreLayer of ignoreLayers) {
            delete layerScores[ignoreLayer]
        }
        const results: Record<string, ThemeSearchScore> = {}
        for (const layoutInfo of themes) {
            const theme = layoutInfo.id
            if (theme === "personal") {
                continue
            }
            if (Utils.simplifyStringForSearch(theme) === query) {
                results[theme] = {
                    theme: layoutInfo,
                    lowest: -1,
                    other: 0,
                }
                continue
            }
            const perLayer = Utils.asRecord(
                layoutInfo.layers ?? [], layer => layerScores[layer],
            )
            const language = Locale.language.data

            const keywords = Utils.NoNullInplace([layoutInfo.shortDescription, layoutInfo.title])
                .map(item => typeof item === "string" ? item : (item[language] ?? item["*"]))


            const other = Math.min(SearchUtils.scoreKeywords(query, keywords), SearchUtils.scoreKeywords(query, layoutInfo.keywords))
            const lowest = Math.min(other, ...Object.values(perLayer))
            results[theme] = {
                theme: layoutInfo,
                perLayer,
                other,
                lowest,
            }
        }
        return results
    }

    public static sortedByLowestScores(search: string, themes: MinimalLayoutInformation[], ignoreLayers: string[] = []): ThemeSearchScore[] {
        const scored = Object.values(this.scoreThemes(search, themes, ignoreLayers))
        scored.sort((a, b) => a.lowest - b.lowest)
        return scored
    }

    public static sortedByLowest(search: string, themes: MinimalLayoutInformation[], ignoreLayers: string[] = []): MinimalLayoutInformation[] {
        return this.sortedByLowestScores(search, themes, ignoreLayers)
            .map(th => th.theme)
    }

}
