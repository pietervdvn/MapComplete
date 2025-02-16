import ThemeConfig, { MinimalThemeInformation } from "../../Models/ThemeConfig/ThemeConfig"
import { Store } from "../UIEventSource"
import UserRelatedState from "../State/UserRelatedState"
import themeOverview from "../../assets/generated/theme_overview.json"
import { OsmConnection } from "../Osm/OsmConnection"
import { AndroidPolyfill } from "../Web/AndroidPolyfill"
import Fuse from "fuse.js"
import Constants from "../../Models/Constants"
import Locale from "../../UI/i18n/Locale"
import { Utils } from "../../Utils"


export class ThemeSearchIndex {

    private readonly themeIndex: Fuse<MinimalThemeInformation>
    private readonly layerIndex: Fuse<{ id: string, description }>

    constructor(language: string, themesToSearch?: MinimalThemeInformation[], layersToIgnore: string[] = []) {
        const themes = Utils.NoNull(themesToSearch ?? ThemeSearch.officialThemes?.themes)
        if (!themes) {
            throw "No themes loaded. Did generate:layeroverview fail?"
        }
        const fuseOptions = {
            ignoreLocation: true,
            threshold: 0.2,
            keys: [
                { name: "id", weight: 2 },
                "title." + language,
                "keywords." + language,
                "shortDescription." + language
            ]
        }

        this.themeIndex = new Fuse(themes.filter(th => th?.id !== "personal"), fuseOptions)

        const toIgnore = new Set(layersToIgnore)
        const layersAsList: { id: string, description: Record<string, string[]> }[] = []
        for (const id in ThemeSearch.officialThemes.layers) {
            if (Constants.isPriviliged(id)) {
                continue
            }
            if (toIgnore.has(id)) {
                continue
            }
            const l: Record<string, string[]> = ThemeSearch.officialThemes.layers[id]
            layersAsList.push({ id, description: l })
        }
        this.layerIndex = new Fuse(layersAsList, {
            includeScore: true,
            minMatchCharLength: 3,
            ignoreLocation: true,
            threshold: 0.02,
            keys: ["id", "description." + language]
        })
    }

    public search(text: string, limit?: number): MinimalThemeInformation[] {
        const scored = this.searchWithScores(text)
        let result = Array.from(scored.entries())
        result.sort((a, b) => b[0] - a[0])
        if (limit) {
            result = result.slice(0, limit)
        }
        return result.map(e => ThemeSearch.officialThemesById.get(e[0]))
    }

    public searchWithScores(text: string): Map<string, number> {
        const result = new Map<string, number>()
        const themeResults = this.themeIndex.search(text)
        for (const themeResult of themeResults) {
            result.set(themeResult.item.id, themeResult.score)
        }

        const layerResults = this.layerIndex.search(text)

        for (const layer of layerResults) {
            const matchingThemes = ThemeSearch.layersToThemes.get(layer.item.id)
            const score = layer.score
            matchingThemes?.forEach(th => {
                const previous = result.get(th.id) ?? 10000
                result.set(th.id, Math.min(previous, score * 5))
            })
        }


        return result
    }

    /**
     * Builds a search index containing all public and visited themes, but ignoring the layers loaded by the current theme
     */
    public static fromState(state: { osmConnection: OsmConnection; theme: ThemeConfig }): Store<ThemeSearchIndex> {
        const layersToIgnore = state.theme.layers.filter((l) => l.isNormal()).map((l) => l.id)
        const knownHidden: Store<string[]> = UserRelatedState.initDiscoveredHiddenThemes(
            state.osmConnection
        ).map((list) => Utils.Dedup(list))
        const otherThemes: MinimalThemeInformation[] = ThemeSearch.officialThemes.themes.filter(
            (th) => th.id !== state.theme.id
        )
        return Locale.language.map(language => {
                const themes = otherThemes.concat(...knownHidden.data.map(id => ThemeSearch.officialThemesById.get(id)))
                return new ThemeSearchIndex(language, themes, layersToIgnore)
            },
            [knownHidden]
        )
    }
}

export default class ThemeSearch {
    public static readonly officialThemes: {
        themes: MinimalThemeInformation[]
        layers: Record<string, Record<string, string[]>>
    } = <any>themeOverview
    public static readonly officialThemesById: Map<string, MinimalThemeInformation> = new Map<
        string,
        MinimalThemeInformation
    >()


    /*
    * For every layer id, states which themes use the layer
     */
    public static readonly layersToThemes: Map<string, MinimalThemeInformation[]> = new Map()
    static {
        for (const th of ThemeSearch.officialThemes.themes ?? []) {
            ThemeSearch.officialThemesById.set(th.id, th)
            for (const layer of th.layers) {
                let list = ThemeSearch.layersToThemes.get(layer)
                if (!list) {
                    list = []
                    ThemeSearch.layersToThemes.set(layer, list)
                }
                list.push(th)
            }
        }
    }

    public static createUrlFor(layout: { id: string }, state?: { layoutToUse?: { id } }): string {
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
        if (
            (location.hostname === "localhost" && !AndroidPolyfill.inAndroid.data) ||
            location.hostname === "127.0.0.1"
        ) {
            linkPrefix = `${path}/theme.html?layout=${layout.id}&`
        }

        if (layout.id.startsWith("http://") || layout.id.startsWith("https://")) {
            linkPrefix = `${path}/theme.html?userlayout=${layout.id}&`
        }

        return `${linkPrefix}`
    }


}
