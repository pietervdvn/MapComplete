import GeocodingProvider, { GeocodingOptions, LayerResult, SearchResult } from "./GeocodingProvider"
import { SpecialVisualizationState } from "../../UI/SpecialVisualization"
import MoreScreen from "../../UI/BigComponents/MoreScreen"
import { ImmutableStore, Store } from "../UIEventSource"
import Constants from "../../Models/Constants"

export default class LayerSearch implements GeocodingProvider<LayerResult> {

    private readonly _state: SpecialVisualizationState
    private readonly _suggestionLimit: number
    private readonly _layerWhitelist : Set<string>
    constructor(state: SpecialVisualizationState, suggestionLimit: number) {
        this._state = state
        this._layerWhitelist = new Set(state.layout.layers.map(l => l.id).filter(id => Constants.added_by_default.indexOf(<any> id) < 0))
        this._suggestionLimit = suggestionLimit
    }

    async search(query: string): Promise<LayerResult[]> {
        return this.searchWrapped(query, 99)
    }

    suggest(query: string, options?: GeocodingOptions): Store<LayerResult[]> {
        return new ImmutableStore(this.searchWrapped(query, this._suggestionLimit ?? 4))
    }


    private searchWrapped(query: string, limit: number): LayerResult[] {
        return this.searchDirect(query, limit)
    }

    public searchDirect(query: string, limit: number): LayerResult[] {
        if (query.length < 1) {
            return []
        }
        const scores = MoreScreen.scoreLayers(query, this._layerWhitelist)
        const asList:(LayerResult & {score:number})[] = []
        for (const layer in scores) {
            asList.push({
                category: "layer",
                payload: this._state.layout.getLayer(layer),
                osm_id: layer,
                score: scores[layer]
            })
        }
        asList.sort((a, b) => a.score - b.score)

        return asList
            .filter(sorted => sorted.score < 2)
            .slice(0, limit)
    }


}
