import { FeatureSource, IndexedFeatureSource } from "./FeatureSource"
import FilteredLayer from "../../Models/FilteredLayer"
import SimpleFeatureSource from "./Sources/SimpleFeatureSource"
import { Feature } from "geojson"
import { UIEventSource } from "../UIEventSource"

/**
 * In some rare cases, some elements are shown on multiple layers (when 'passthrough' is enabled)
 * If this is the case, multiple objects with a different _matching_layer_id are generated.
 * In any case, this featureSource marks the objects with _matching_layer_id
 */
export default class PerLayerFeatureSourceSplitter<T extends FeatureSource = FeatureSource> {
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
        /**
         * Keeps track of the ids that are included per layer.
         * Used to know if the downstream feature source needs to be pinged
         */
        let layerIndexes: ReadonlySet<string>[] = layers.map((_) => new Set<string>())
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
            /**
             * Indexed on layer-position
             * Will be true if a new id pops up
             */
            const hasChanged: boolean[] = layers.map((_) => false)
            const newIndices: Set<string>[] = layers.map((_) => new Set<string>())
            const noLayerFound: Feature[] = []

            for (const layer of layers) {
                featuresPerLayer.set(layer.layerDef.id, [])
            }

            for (const f of features) {
                let foundALayer = false
                for (let i = 0; i < layers.length; i++) {
                    const layer = layers[i]
                    if (layer.layerDef.source.osmTags.matchesProperties(f.properties)) {
                        const id = f.properties.id
                        // We have found our matching layer!
                        const previousIndex = layerIndexes[i]
                        hasChanged[i] = hasChanged[i] || !previousIndex.has(id)
                        newIndices[i].add(id)
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
            for (let i = 0; i < layers.length; i++) {
                const layer = layers[i]
                const id = layer.layerDef.id
                const features = featuresPerLayer.get(id)
                if (features === undefined) {
                    // No such features for this layer
                    continue
                }

                if (!hasChanged[i] && layerIndexes[i].size === newIndices[i].size) {
                    // No new id has been added and the sizes are the same (thus: nothing has been removed as well)
                    // We can safely assume that no changes were made
                    continue
                }

                layerSources.get(id).setData(features)
            }

            layerIndexes = newIndices

            // AT last, the leftovers are handled
            if (options?.handleLeftovers !== undefined && noLayerFound.length > 0) {
                options.handleLeftovers(noLayerFound)
            }
        })
    }

    public forEach(f: (featureSource: T) => void) {
        for (const fs of this.perLayer.values()) {
            f(fs)
        }
    }
}
