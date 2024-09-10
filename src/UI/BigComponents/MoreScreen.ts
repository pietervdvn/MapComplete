import { MinimalLayoutInformation } from "../../Models/ThemeConfig/LayoutConfig"
import { Store } from "../../Logic/UIEventSource"
import { Utils } from "../../Utils"
import themeOverview from "../../assets/generated/theme_overview.json"
import Locale from "../i18n/Locale"
import { OsmConnection } from "../../Logic/Osm/OsmConnection"

export  type ThemeSearchScore = {
    theme: MinimalLayoutInformation,
    lowest: number,
    perLayer?: Record<string, number>,
    other: number
}
export default class MoreScreen {
    public static readonly officialThemes: {
        themes: MinimalLayoutInformation[],
        layers: Record<string, Record<string, string[]>>
    } = themeOverview
    public static readonly officialThemesById: Map<string, MinimalLayoutInformation> = new Map<string, MinimalLayoutInformation>()
    static {
        for (const th of MoreScreen.officialThemes.themes ?? []) {
            MoreScreen.officialThemesById.set(th.id, th)
        }
    }

    /** Applies special search terms, such as 'studio', 'osmcha', ...
     * Returns 'false' if nothing is matched.
     * Doesn't return control flow if a match is found (navigates to another page in this case)
     */
    public static applySearch(searchTerm: string, ) {
        searchTerm = searchTerm.toLowerCase()
        if (!searchTerm) {
            return false
        }
        if (searchTerm === "personal") {
            window.location.href = MoreScreen.createUrlFor({ id: "personal" })
        }
        if (searchTerm === "bugs" || searchTerm === "issues") {
            window.location.href = "https://github.com/pietervdvn/MapComplete/issues"
        }
        if (searchTerm === "source") {
            window.location.href = "https://github.com/pietervdvn/MapComplete"
        }
        if (searchTerm === "docs") {
            window.location.href = "https://github.com/pietervdvn/MapComplete/tree/develop/Docs"
        }
        if (searchTerm === "osmcha" || searchTerm === "stats") {
            window.location.href = Utils.OsmChaLinkFor(7)
        }
        if (searchTerm === "studio") {
            window.location.href = "./studio.html"
        }
        return false

    }

    /**
     * Searches for the smallest distance in words; will split both the query and the terms
     *
     * MoreScreen.scoreKeywords("drinking water", {"en": ["A layer with drinking water points"]}, "en") // => 0
     * MoreScreen.scoreKeywords("waste", {"en": ["A layer with drinking water points"]}, "en") // => 2
     *
     */
    public static scoreKeywords(query: string, keywords: Record<string, string[]> | string[], language?: string): number {
        if(!keywords){
            return Infinity
        }
        language ??= Locale.language.data
        const queryParts = query.trim().split(" ").map(q => Utils.simplifyStringForSearch(q))
        let terms: string[]
        if (Array.isArray(keywords)) {
            terms = keywords
        } else {
            terms = (keywords[language] ?? []).concat(keywords["*"])
        }
        const termsAll = Utils.NoNullInplace(terms).flatMap(t => t.split(" "))

        let distanceSummed = 0
        for (let i = 0; i < queryParts.length; i++) {
            const q = queryParts[i]
            let minDistance: number = 99
            for (const term of termsAll) {
                const d = Utils.levenshteinDistance(q, Utils.simplifyStringForSearch(term))
                if (d < minDistance) {
                    minDistance = d
                }
            }
            distanceSummed += minDistance
        }
        return distanceSummed
    }

    public static scoreLayers(query: string, layerWhitelist?: Set<string>): Record<string, number> {
        const result: Record<string, number> = {}
        for (const id in this.officialThemes.layers) {
            if(layerWhitelist !== undefined && !layerWhitelist.has(id)){
                continue
            }
            const keywords = this.officialThemes.layers[id]
            const distance = this.scoreKeywords(query, keywords)
            result[id] = distance
        }
        return result
    }


    public static scoreThemes(query: string, themes: MinimalLayoutInformation[], ignoreLayers: string[] = []): Record<string, ThemeSearchScore> {
        if (query?.length < 1) {
            return undefined
        }
        themes = Utils.NoNullInplace(themes)
        const layerScores = this.scoreLayers(query)
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
                    other: 0
                }
                continue
            }
            const perLayer = Utils.asRecord(
                layoutInfo.layers ?? [], layer => layerScores[layer]
            )
            const language = Locale.language.data

            const keywords =Utils.NoNullInplace( [layoutInfo.shortDescription, layoutInfo.title])
                .map(item => typeof item === "string" ? item : (item[language] ?? item["*"]))


            const other = Math.min(this.scoreKeywords(query, keywords), this.scoreKeywords(query, layoutInfo.keywords))
            const lowest = Math.min(other, ...Object.values(perLayer))
            results[theme] = {
                theme:layoutInfo,
                perLayer,
                other,
                lowest
            }
        }
        return results
    }

    public static sortedByLowest(search: string, themes: MinimalLayoutInformation[], ignoreLayers: string[] = []){
        const scored = Object.values(this.scoreThemes(search, themes, ignoreLayers ))
        scored.sort((a,b) => a.lowest - b.lowest)
        return scored
    }

    public static createUrlFor(
        layout: { id: string },
        state?: { layoutToUse?: { id } }
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

}
