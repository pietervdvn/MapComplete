import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import FilteredLayer from "../../Models/FilteredLayer";
import OverpassFeatureSource from "../Actors/OverpassFeatureSource";
import SimpleFeatureSource from "./SimpleFeatureSource";


/**
 * In some rare cases, some elements are shown on multiple layers (when 'passthrough' is enabled)
 * If this is the case, multiple objects with a different _matching_layer_id are generated.
 * In any case, this featureSource marks the objects with _matching_layer_id
 */
export default class PerLayerFeatureSourceSplitter {

    constructor(layers: UIEventSource<FilteredLayer[]>,
                handleLayerData: (source: FeatureSource) => void,
                upstream: OverpassFeatureSource) {

        const knownLayers = new Map<string, FeatureSource>()

        function update() {
            const features = upstream.features.data;
            if (features === undefined) {
                return;
            }
            if(layers.data === undefined){
                return;
            }

            // We try to figure out (for each feature) in which feature store it should be saved.
            // Note that this splitter is only run when it is invoked by the overpass feature source, so we can't be sure in which layer it should go

            const featuresPerLayer = new Map<string, { feature, freshness } []>();

            function addTo(layer: FilteredLayer, feature: { feature, freshness }) {
                const id = layer.layerDef.id
                const list = featuresPerLayer.get(id)
                if (list !== undefined) {
                    list.push(feature)
                } else {
                    featuresPerLayer.set(id, [feature])
                }
            }

            for (const f of features) {
                for (const layer of layers.data) {
                    if (layer.layerDef.source.osmTags.matchesProperties(f.feature.properties)) {
                        // We have found our matching layer!
                        addTo(layer, f)
                        if (!layer.layerDef.passAllFeatures) {
                            // If not 'passAllFeatures', we are done for this feature
                            break;
                        }
                    }
                }
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
                    featureSource = new SimpleFeatureSource(layer)
                    knownLayers.set(id, featureSource)
                    handleLayerData(featureSource)
                }
                featureSource.features.setData(features)
            }


            upstream.features.addCallbackAndRunD(_ => update())
            layers.addCallbackAndRunD(_ => update())

        }
        
        layers.addCallbackAndRunD(_ => update())
        upstream.features.addCallbackAndRunD(_ => update())
    }
}