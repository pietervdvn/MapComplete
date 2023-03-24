/**
 * SHows geojson on the given leaflet map, but attempts to figure out the correct layer first
 */
import { Store } from "../../Logic/UIEventSource"
import ShowDataLayer from "./ShowDataLayer"
import PerLayerFeatureSourceSplitter from "../../Logic/FeatureSource/PerLayerFeatureSourceSplitter"
import FilteredLayer from "../../Models/FilteredLayer"
import { ShowDataLayerOptions } from "./ShowDataLayerOptions"
import { Map as MlMap } from "maplibre-gl"
export default class ShowDataMultiLayer {
    constructor(
        map: Store<MlMap>,
        options: ShowDataLayerOptions & { layers: Store<FilteredLayer[]> }
    ) {
        new PerLayerFeatureSourceSplitter(
            options.layers,
            (perLayer) => {
                const newOptions = {
                    ...options,
                    layer: perLayer.layer.layerDef,
                    features: perLayer,
                }
                new ShowDataLayer(map, newOptions)
            },
            options.features
        )
    }
}
