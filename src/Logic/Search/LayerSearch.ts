import SearchUtils from "./SearchUtils"
import ThemeSearch from "./ThemeSearch"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import ThemeConfig from "../../Models/ThemeConfig/ThemeConfig"
import { Utils } from "../../Utils"

export default class LayerSearch {
    private readonly _theme: ThemeConfig
    private readonly _layerWhitelist: Set<string>

    constructor(theme: ThemeConfig) {
        this._theme = theme
        this._layerWhitelist = new Set(theme.layers.filter((l) => l.isNormal()).map((l) => l.id))
    }

    static scoreLayers(
        query: string,
        options: {
            whitelist?: Set<string>
            blacklist?: Set<string>
        }
    ): Record<string, number> {
        const result: Record<string, number> = {}
        const queryParts = query
            .trim()
            .split(" ")
            .map((q) => Utils.simplifyStringForSearch(q))
        for (const id in ThemeSearch.officialThemes.layers) {
            if (options?.whitelist && !options?.whitelist.has(id)) {
                continue
            }
            if (options?.blacklist?.has(id)) {
                continue
            }
            const keywords = ThemeSearch.officialThemes.layers[id]
            result[id] = Math.min(...queryParts.map((q) => SearchUtils.scoreKeywords(q, keywords)))
        }
        return result
    }

    public search(query: string, limit: number, scoreThreshold: number = 2): LayerConfig[] {
        if (query.length < 1) {
            return []
        }
        const scores = LayerSearch.scoreLayers(query, { whitelist: this._layerWhitelist })
        const asList: { layer: LayerConfig; score: number }[] = []
        for (const layer in scores) {
            asList.push({
                layer: this._theme.getLayer(layer),
                score: scores[layer],
            })
        }
        asList.sort((a, b) => a.score - b.score)

        return asList
            .filter((sorted) => sorted.score < scoreThreshold)
            .slice(0, limit)
            .map((l) => l.layer)
    }
}
