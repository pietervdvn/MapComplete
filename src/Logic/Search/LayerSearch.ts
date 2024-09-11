import { SpecialVisualizationState } from "../../UI/SpecialVisualization"
import Constants from "../../Models/Constants"
import SearchUtils from "./SearchUtils"
import ThemeSearch from "./ThemeSearch"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"

export default class LayerSearch {

    private readonly _state: SpecialVisualizationState
    private readonly _layerWhitelist : Set<string>
    constructor(state: SpecialVisualizationState) {
        this._state = state
        this._layerWhitelist = new Set(state.layout.layers.map(l => l.id).filter(id => Constants.added_by_default.indexOf(<any> id) < 0))
    }

    static scoreLayers(query: string, layerWhitelist?: Set<string>): Record<string, number> {
        const result: Record<string, number> = {}
        for (const id in ThemeSearch.officialThemes.layers) {
            if(layerWhitelist !== undefined && !layerWhitelist.has(id)){
                continue
            }
            const keywords = ThemeSearch.officialThemes.layers[id]
            const distance = SearchUtils.scoreKeywords(query, keywords)
            result[id] = distance
        }
        return result
    }


    public search(query: string, limit: number): LayerConfig[] {
        if (query.length < 1) {
            return []
        }
        const scores = LayerSearch.scoreLayers(query, this._layerWhitelist)
        const asList:({layer: LayerConfig, score:number})[] = []
        for (const layer in scores) {
            asList.push({
                layer: this._state.layout.getLayer(layer),
                score: scores[layer]
            })
        }
        asList.sort((a, b) => a.score - b.score)

        return asList
            .filter(sorted => sorted.score < 2)
            .slice(0, limit)
            .map(l => l.layer)
    }


}
