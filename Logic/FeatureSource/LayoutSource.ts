import FeatureSource from "./FeatureSource"
import { Store } from "../UIEventSource"
import FeatureSwitchState from "../State/FeatureSwitchState"
import OverpassFeatureSource from "../Actors/OverpassFeatureSource"
import { BBox } from "../BBox"
import OsmFeatureSource from "./TiledFeatureSource/OsmFeatureSource"
import { Or } from "../Tags/Or"
import FeatureSourceMerger from "./Sources/FeatureSourceMerger"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import GeoJsonSource from "./Sources/GeoJsonSource"
import DynamicGeoJsonTileSource from "./TiledFeatureSource/DynamicGeoJsonTileSource"

/**
 * This source will fetch the needed data from various sources for the given layout.
 *
 * Note that special layers (with `source=null` will be ignored)
 */
export default class LayoutSource extends FeatureSourceMerger {
    constructor(
        filteredLayers: LayerConfig[],
        featureSwitches: FeatureSwitchState,
        newAndChangedElements: FeatureSource,
        mapProperties: { bounds: Store<BBox>; zoom: Store<number> },
        backend: string,
        isLayerActive: (id: string) => Store<boolean>
    ) {
        const { bounds, zoom } = mapProperties
        // remove all 'special' layers
        filteredLayers = filteredLayers.filter((flayer) => flayer.source !== null)

        const geojsonlayers = filteredLayers.filter(
            (flayer) => flayer.source.geojsonSource !== undefined
        )
        const osmLayers = filteredLayers.filter(
            (flayer) => flayer.source.geojsonSource === undefined
        )
        const overpassSource = LayoutSource.setupOverpass(osmLayers, bounds, zoom, featureSwitches)
        const osmApiSource = LayoutSource.setupOsmApiSource(
            osmLayers,
            bounds,
            zoom,
            backend,
            featureSwitches
        )
        const geojsonSources: FeatureSource[] = geojsonlayers.map((l) =>
            LayoutSource.setupGeojsonSource(l, mapProperties)
        )

        const expiryInSeconds = Math.min(...(filteredLayers?.map((l) => l.maxAgeOfCache) ?? []))
        super(overpassSource, osmApiSource, newAndChangedElements, ...geojsonSources)
    }

    private static setupGeojsonSource(
        layer: LayerConfig,
        mapProperties: { zoom: Store<number>; bounds: Store<BBox> },
        isActive?: Store<boolean>
    ): FeatureSource {
        const source = layer.source
        if (source.geojsonZoomLevel === undefined) {
            // This is a 'load everything at once' geojson layer
            return new GeoJsonSource(layer, { isActive })
        } else {
            return new DynamicGeoJsonTileSource(layer, mapProperties, { isActive })
        }
    }

    private static setupOsmApiSource(
        osmLayers: LayerConfig[],
        bounds: Store<BBox>,
        zoom: Store<number>,
        backend: string,
        featureSwitches: FeatureSwitchState
    ): FeatureSource {
        const minzoom = Math.min(...osmLayers.map((layer) => layer.minzoom))
        const isActive = zoom.mapD((z) => {
            if (z < minzoom) {
                // We are zoomed out over the zoomlevel of any layer
                console.debug("Disabling overpass source: zoom < minzoom")
                return false
            }

            // Overpass should handle this if zoomed out a bit
            return z > featureSwitches.overpassMaxZoom.data
        })
        const allowedFeatures = new Or(osmLayers.map((l) => l.source.osmTags)).optimize()
        if (typeof allowedFeatures === "boolean") {
            throw "Invalid filter to init OsmFeatureSource: it optimizes away to " + allowedFeatures
        }
        return new OsmFeatureSource({
            allowedFeatures,
            bounds,
            backend,
            isActive,
        })
    }

    private static setupOverpass(
        osmLayers: LayerConfig[],
        bounds: Store<BBox>,
        zoom: Store<number>,
        featureSwitches: FeatureSwitchState
    ): FeatureSource {
        const minzoom = Math.min(...osmLayers.map((layer) => layer.minzoom))
        const isActive = zoom.mapD((z) => {
            if (z < minzoom) {
                // We are zoomed out over the zoomlevel of any layer
                console.debug("Disabling overpass source: zoom < minzoom")
                return false
            }

            return z <= featureSwitches.overpassMaxZoom.data
        })

        return new OverpassFeatureSource(
            {
                zoom,
                bounds,
                layoutToUse: featureSwitches.layoutToUse,
                overpassUrl: featureSwitches.overpassUrl,
                overpassTimeout: featureSwitches.overpassTimeout,
                overpassMaxZoom: featureSwitches.overpassMaxZoom,
            },
            {
                padToTiles: zoom.map((zoom) => Math.min(15, zoom + 1)),
                isActive,
            }
        )
    }
}
