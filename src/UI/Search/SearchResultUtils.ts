import { SpecialVisualizationState } from "../SpecialVisualization"
import { FilterPayload } from "../../Logic/Geocoding/GeocodingProvider"

export default class SearchResultUtils {
    static apply(payload: FilterPayload, state: SpecialVisualizationState) {
        const { layer, filter, index, option } = payload

        let flayer = state.layerState.filteredLayers.get(layer.id)
        let filtercontrol = flayer.appliedFilters.get(filter.id)

        for (const [name, otherLayer] of state.layerState.filteredLayers) {
            if (name === layer.id) {
                otherLayer.isDisplayed.setData(true)
                continue
            }
            otherLayer.isDisplayed.setData(false)
        }

        if (filtercontrol.data === index) {
            filtercontrol.setData(undefined)
        } else {
            filtercontrol.setData(index)
        }
    }
}
