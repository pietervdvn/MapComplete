import SearchUtils from "./SearchUtils"
import ThemeSearch from "./ThemeSearch"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
import { Utils } from "../../Utils"

export default class LayerSearch {

    private readonly _layout: LayoutConfig
    private readonly _layerWhitelist: Set<string>

    constructor(layout: LayoutConfig) {
        this._layout = layout
        this._layerWhitelist = new Set(layout.layers
            .filter(l => l.isNormal())
            .map(l => l.id))
    }

    static scoreLayers(query: string, options: {
        whitelist?: Set<string>, blacklist?: Set<string>
    }): Record<string, number> {
        const result: Record<string, number> = {}
        const queryParts = query.trim().split(" ").map(q => Utils.simplifyStringForSearch(q))
        for (const id in ThemeSearch.officialThemes.layers) {
            if (options?.whitelist && !options?.whitelist.has(id)) {
                continue
            }
            if (options?.blacklist?.has(id)) {
                continue
            }
            const keywords = ThemeSearch.officialThemes.layers[id]
            const distance = Math.min(...queryParts.map(q => SearchUtils.scoreKeywords(q, keywords)))
            result[id] = distance
        }
        return result
    }


    public search(query: string, limit: number, scoreThreshold: number = 2): LayerConfig[] {
        if (query.length < 1) {
            return []
        }
        const scores = LayerSearch.scoreLayers(query, { whitelist: this._layerWhitelist })
        const asList: ({ layer: LayerConfig, score: number })[] = []
        for (const layer in scores) {
            asList.push({
                layer: this._layout.getLayer(layer),
                score: scores[layer],
            })
        }
        asList.sort((a, b) => a.score - b.score)

        return asList
            .filter(sorted => sorted.score < scoreThreshold)
            .slice(0, limit)
            .map(l => l.layer)
    }


}
