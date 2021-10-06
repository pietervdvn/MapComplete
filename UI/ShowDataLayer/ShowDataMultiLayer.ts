/**
 * SHows geojson on the given leaflet map, but attempts to figure out the correct layer first
 */
import {UIEventSource} from "../../Logic/UIEventSource";
import ShowDataLayer from "./ShowDataLayer";
import PerLayerFeatureSourceSplitter from "../../Logic/FeatureSource/PerLayerFeatureSourceSplitter";
import FilteredLayer from "../../Models/FilteredLayer";
import {ShowDataLayerOptions} from "./ShowDataLayerOptions";

export default class ShowDataMultiLayer {
    constructor(options: ShowDataLayerOptions & { layers: UIEventSource<FilteredLayer[]> }) {

        new PerLayerFeatureSourceSplitter(options.layers, (perLayer => {
                const newOptions = {
                    layerToShow: perLayer.layer.layerDef,
                    ...options
                }
                new ShowDataLayer(newOptions)
            }),
            options.features)

    }
}