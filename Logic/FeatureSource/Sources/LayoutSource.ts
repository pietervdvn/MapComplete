import GeoJsonSource from "./GeoJsonSource"
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
import { FeatureSource } from "../FeatureSource"
import { Or } from "../../Tags/Or"
import FeatureSwitchState from "../../State/FeatureSwitchState"
import OverpassFeatureSource from "./OverpassFeatureSource"
import { ImmutableStore, Store } from "../../UIEventSource"
import OsmFeatureSource from "./OsmFeatureSource"
import FeatureSourceMerger from "./FeatureSourceMerger"
import DynamicGeoJsonTileSource from "../TiledFeatureSource/DynamicGeoJsonTileSource"
import { BBox } from "../../BBox"
import LocalStorageFeatureSource from "../TiledFeatureSource/LocalStorageFeatureSource"
import StaticFeatureSource from "./StaticFeatureSource"

/**
 * This source will fetch the needed data from various sources for the given layout.
 *
 * Note that special layers (with `source=null` will be ignored)
 */
export default class LayoutSource extends FeatureSourceMerger {
    /**
     * Indicates if a data source is loading something
     * TODO fixme
     */
    public readonly isLoading: Store<boolean> = new ImmutableStore(false)
    constructor(
        layers: LayerConfig[],
        featureSwitches: FeatureSwitchState,
        newAndChangedElements: FeatureSource,
        mapProperties: { bounds: Store<BBox>; zoom: Store<number> },
        backend: string,
        isDisplayed: (id: string) => Store<boolean>
    ) {
        const { bounds, zoom } = mapProperties
        // remove all 'special' layers
        layers = layers.filter((layer) => layer.source !== null && layer.source !== undefined)

        const geojsonlayers = layers.filter((layer) => layer.source.geojsonSource !== undefined)
        const osmLayers = layers.filter((layer) => layer.source.geojsonSource === undefined)
        const fromCache = osmLayers.map(
            (l) =>
                new LocalStorageFeatureSource(l.id, 15, mapProperties, {
                    isActive: isDisplayed(l.id),
                })
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
            LayoutSource.setupGeojsonSource(l, mapProperties, isDisplayed(l.id))
        )

        const expiryInSeconds = Math.min(...(layers?.map((l) => l.maxAgeOfCache) ?? []))
        super(overpassSource, osmApiSource, newAndChangedElements, ...geojsonSources, ...fromCache)
    }

    private static setupGeojsonSource(
        layer: LayerConfig,
        mapProperties: { zoom: Store<number>; bounds: Store<BBox> },
        isActive?: Store<boolean>
    ): FeatureSource {
        const source = layer.source
        isActive = mapProperties.zoom.map(
            (z) => (isActive?.data ?? true) && z >= layer.maxzoom,
            [isActive]
        )
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
        if (osmLayers.length == 0) {
            return new StaticFeatureSource(new ImmutableStore([]))
        }
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
        if (osmLayers.length == 0) {
            return new StaticFeatureSource(new ImmutableStore([]))
        }
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
                layers: osmLayers,
                widenFactor: featureSwitches.layoutToUse.widenFactor,
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
