import FeatureSource, { FeatureSourceForLayer } from "./FeatureSource"
import FilteredLayer from "../../Models/FilteredLayer"
import SimpleFeatureSource from "./Sources/SimpleFeatureSource"
import { Feature } from "geojson"
import { Utils } from "../../Utils"
import { UIEventSource } from "../UIEventSource"
import { feature } from "@turf/turf"

/**
 * In some rare cases, some elements are shown on multiple layers (when 'passthrough' is enabled)
 * If this is the case, multiple objects with a different _matching_layer_id are generated.
 * In any case, this featureSource marks the objects with _matching_layer_id
 */
export default class PerLayerFeatureSourceSplitter<
    T extends FeatureSourceForLayer = SimpleFeatureSource
> {
    public readonly perLayer: ReadonlyMap<string, T>
    constructor(
        layers: FilteredLayer[],
        upstream: FeatureSource,
        options?: {
            constructStore?: (features: UIEventSource<Feature[]>, layer: FilteredLayer) => T
            handleLeftovers?: (featuresWithoutLayer: Feature[]) => void
        }
    ) {
        const knownLayers = new Map<string, T>()
        this.perLayer = knownLayers
        const layerSources = new Map<string, UIEventSource<Feature[]>>()

        const constructStore =
            options?.constructStore ?? ((store, layer) => new SimpleFeatureSource(layer, store))
        for (const layer of layers) {
            const src = new UIEventSource<Feature[]>([])
            layerSources.set(layer.layerDef.id, src)
            knownLayers.set(layer.layerDef.id, <T>constructStore(src, layer))
        }

        upstream.features.addCallbackAndRunD((features) => {
            if (layers === undefined) {
                return
            }

            // We try to figure out (for each feature) in which feature store it should be saved.

            const featuresPerLayer = new Map<string, Feature[]>()
            const noLayerFound: Feature[] = []

            for (const layer of layers) {
                featuresPerLayer.set(layer.layerDef.id, [])
            }

            for (const f of features) {
                let foundALayer = false
                for (const layer of layers) {
                    if (layer.layerDef.source.osmTags.matchesProperties(f.properties)) {
                        // We have found our matching layer!
                        featuresPerLayer.get(layer.layerDef.id).push(f)
                        foundALayer = true
                        if (!layer.layerDef.passAllFeatures) {
                            // If not 'passAllFeatures', we are done for this feature
                            break
                        }
                    }
                }
                if (!foundALayer) {
                    noLayerFound.push(f)
                }
            }

            // At this point, we have our features per layer as a list
            // We assign them to the correct featureSources
            for (const layer of layers) {
                const id = layer.layerDef.id
                const features = featuresPerLayer.get(id)
                if (features === undefined) {
                    // No such features for this layer
                    continue
                }

                const src = layerSources.get(id)

                if (Utils.sameList(src.data, features)) {
                    continue
                }
                src.setData(features)
            }

            // AT last, the leftovers are handled
            if (options?.handleLeftovers !== undefined && noLayerFound.length > 0) {
                options.handleLeftovers(noLayerFound)
            }
        })
    }

    public forEach(f: (featureSource: FeatureSourceForLayer) => void) {
        for (const fs of this.perLayer.values()) {
            f(fs)
        }
    }
}
