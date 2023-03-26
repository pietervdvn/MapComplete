/**
 * SHows geojson on the given leaflet map, but attempts to figure out the correct layer first
 */
import { ImmutableStore, Store } from "../../Logic/UIEventSource"
import ShowDataLayer from "./ShowDataLayer"
import PerLayerFeatureSourceSplitter from "../../Logic/FeatureSource/PerLayerFeatureSourceSplitter"
import FilteredLayer from "../../Models/FilteredLayer"
import { ShowDataLayerOptions } from "./ShowDataLayerOptions"
import { Map as MlMap } from "maplibre-gl"
import FilteringFeatureSource from "../../Logic/FeatureSource/Sources/FilteringFeatureSource"
import { GlobalFilter } from "../../Models/GlobalFilter"

export default class ShowDataMultiLayer {
    constructor(
        map: Store<MlMap>,
        options: ShowDataLayerOptions & {
            layers: FilteredLayer[]
            globalFilters?: Store<GlobalFilter[]>
        }
    ) {
        new PerLayerFeatureSourceSplitter(
            new ImmutableStore(options.layers),
            (features, layer) => {
                const newOptions = {
                    ...options,
                    layer: layer.layerDef,
                    features: new FilteringFeatureSource(
                        layer,
                        features,
                        options.fetchStore,
                        options.globalFilters
                    ),
                }
                new ShowDataLayer(map, newOptions)
            },
            options.features
        )
    }
}
