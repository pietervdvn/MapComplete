import FeatureSource, {FeatureSourceForLayer, Tiled} from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import FilteredLayer from "../../Models/FilteredLayer";
import SimpleFeatureSource from "./Sources/SimpleFeatureSource";


/**
 * In some rare cases, some elements are shown on multiple layers (when 'passthrough' is enabled)
 * If this is the case, multiple objects with a different _matching_layer_id are generated.
 * In any case, this featureSource marks the objects with _matching_layer_id
 */
export default class PerLayerFeatureSourceSplitter {

    constructor(layers: UIEventSource<FilteredLayer[]>,
                handleLayerData: (source: FeatureSourceForLayer & Tiled) => void,
                upstream: FeatureSource,
                options?: {
                    tileIndex?: number,
                    handleLeftovers?: (featuresWithoutLayer: any[]) => void
                }) {

        const knownLayers = new Map<string, FeatureSourceForLayer & Tiled>()

        function update() {
            const features = upstream.features?.data;
            if (features === undefined) {
                return;
            }
            if (layers.data === undefined || layers.data.length === 0) {
                return;
            }

            // We try to figure out (for each feature) in which feature store it should be saved.
            // Note that this splitter is only run when it is invoked by the overpass feature source, so we can't be sure in which layer it should go

            const featuresPerLayer = new Map<string, { feature, freshness } []>();
            const noLayerFound = []

            for (const layer of layers.data) {
                featuresPerLayer.set(layer.layerDef.id, [])
            }

            for (const f of features) {
                console.log("Classifying ", f.feature)
                for (const layer of layers.data) {
                    if (layer.layerDef.source.osmTags.matchesProperties(f.feature.properties)) {
                        // We have found our matching layer!
                        featuresPerLayer.get(layer.layerDef.id).push(f)
                        if (!layer.layerDef.passAllFeatures) {
                            // If not 'passAllFeatures', we are done for this feature
                            break;
                        }
                    }
                }
                noLayerFound.push(f)
            }

            // At this point, we have our features per layer as a list
            // We assign them to the correct featureSources
            for (const layer of layers.data) {
                const id = layer.layerDef.id;
                const features = featuresPerLayer.get(id)
                if (features === undefined) {
                    // No such features for this layer
                    continue;
                }

                let featureSource = knownLayers.get(id)
                if (featureSource === undefined) {
                    // Not yet initialized - now is a good time
                    featureSource = new SimpleFeatureSource(layer, options?.tileIndex)
                    featureSource.features.setData(features)
                    knownLayers.set(id, featureSource)
                    handleLayerData(featureSource)
                } else {
                    featureSource.features.setData(features)
                }
            }

            // AT last, the leftovers are handled
            if (options?.handleLeftovers !== undefined && noLayerFound.length > 0) {
                options.handleLeftovers(noLayerFound)
            }
        }

        layers.addCallback(_ => update())
        upstream.features.addCallbackAndRunD(_ => update())
    }
}