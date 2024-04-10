import GeoJsonSource from "./GeoJsonSource"
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
import { UpdatableFeatureSource } from "../FeatureSource"
import { Or } from "../../Tags/Or"
import FeatureSwitchState from "../../State/FeatureSwitchState"
import OverpassFeatureSource from "./OverpassFeatureSource"
import { Store, UIEventSource } from "../../UIEventSource"
import OsmFeatureSource from "./OsmFeatureSource"
import DynamicGeoJsonTileSource from "../TiledFeatureSource/DynamicGeoJsonTileSource"
import { BBox } from "../../BBox"
import LocalStorageFeatureSource from "../TiledFeatureSource/LocalStorageFeatureSource"
import FullNodeDatabaseSource from "../TiledFeatureSource/FullNodeDatabaseSource"
import DynamicMvtileSource from "../TiledFeatureSource/DynamicMvtTileSource"
import FeatureSourceMerger from "./FeatureSourceMerger"

/**
 * This source will fetch the needed data from various sources for the given layout.
 *
 * Note that special layers (with `source=null` will be ignored)
 */
export default class LayoutSource extends FeatureSourceMerger {
    /**
     * Indicates if a data source is loading something
     */
    public readonly isLoading: Store<boolean>

    private readonly supportsForceDownload: UpdatableFeatureSource[]

    private readonly fromCache: Map<string, LocalStorageFeatureSource>
    public static readonly fromCacheZoomLevel = 15
    constructor(
        layers: LayerConfig[],
        featureSwitches: FeatureSwitchState,
        mapProperties: { bounds: Store<BBox>; zoom: Store<number> },
        backend: string,
        isDisplayed: (id: string) => Store<boolean>,
        mvtAvailableLayers: Set<string>,
        fullNodeDatabaseSource?: FullNodeDatabaseSource
    ) {
        const supportsForceDownload: UpdatableFeatureSource[] = []

        const { bounds, zoom } = mapProperties
        // remove all 'special' layers
        layers = layers.filter((layer) => layer.source !== null && layer.source !== undefined)

        const geojsonlayers = layers.filter((layer) => layer.source.geojsonSource !== undefined)
        const osmLayers = layers.filter((layer) => layer.source.geojsonSource === undefined)
        const fromCache = new Map<string, LocalStorageFeatureSource>()
        for (const layer of osmLayers) {
            const src = new LocalStorageFeatureSource(
                backend,
                layer,
                LayoutSource.fromCacheZoomLevel,
                mapProperties,
                {
                    isActive: isDisplayed(layer.id),
                    maxAge: layer.maxAgeOfCache,
                }
            )
            fromCache.set(layer.id, src)
        }

        const mvtSources: UpdatableFeatureSource[] = osmLayers
            .filter((f) => mvtAvailableLayers.has(f.id))
            .map((l) => LayoutSource.setupMvtSource(l, mapProperties, isDisplayed(l.id)))
        const nonMvtSources = []
        const nonMvtLayers = osmLayers.filter((l) => !mvtAvailableLayers.has(l.id))

        const isLoading = new UIEventSource(false)

        const osmApiSource = LayoutSource.setupOsmApiSource(
            osmLayers,
            bounds,
            zoom,
            backend,
            featureSwitches,
            fullNodeDatabaseSource
        )
        nonMvtSources.push(osmApiSource)

        let overpassSource: OverpassFeatureSource = undefined
        if (nonMvtLayers.length > 0) {
            console.log(
                "Layers ",
                nonMvtLayers.map((l) => l.id),
                " cannot be fetched from the cache server, defaulting to overpass/OSM-api"
            )
            overpassSource = LayoutSource.setupOverpass(osmLayers, bounds, zoom, featureSwitches)
            nonMvtSources.push(overpassSource)
            supportsForceDownload.push(overpassSource)
        }

        function setIsLoading() {
            const loading = overpassSource?.runningQuery?.data || osmApiSource?.isRunning?.data
            isLoading.setData(loading)
        }

        overpassSource?.runningQuery?.addCallbackAndRun(() => setIsLoading())
        osmApiSource?.isRunning?.addCallbackAndRun(() => setIsLoading())

        const geojsonSources: UpdatableFeatureSource[] = geojsonlayers.map((l) =>
            LayoutSource.setupGeojsonSource(l, mapProperties, isDisplayed(l.id))
        )

        super(...geojsonSources, ...Array.from(fromCache.values()), ...mvtSources, ...nonMvtSources)

        this.isLoading = isLoading
        this.fromCache = fromCache
        supportsForceDownload.push(...geojsonSources)
        supportsForceDownload.push(...mvtSources) // Non-mvt sources are handled by overpass
        this.supportsForceDownload = supportsForceDownload
    }

    private static setupMvtSource(
        layer: LayerConfig,
        mapProperties: { zoom: Store<number>; bounds: Store<BBox> },
        isActive?: Store<boolean>
    ): UpdatableFeatureSource {
        return new DynamicMvtileSource(layer, mapProperties, { isActive })
    }

    private static setupGeojsonSource(
        layer: LayerConfig,
        mapProperties: { zoom: Store<number>; bounds: Store<BBox> },
        isActiveByFilter?: Store<boolean>
    ): UpdatableFeatureSource {
        const source = layer.source
        const isActive = mapProperties.zoom.map(
            (z) => (isActiveByFilter?.data ?? true) && z >= layer.minzoom,
            [isActiveByFilter]
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
        featureSwitches: FeatureSwitchState,
        fullNodeDatabase: FullNodeDatabaseSource
    ): OsmFeatureSource | undefined {
        if (osmLayers.length == 0) {
            return undefined
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
            patchRelations: true,
            fullNodeDatabase,
        })
    }

    private static setupOverpass(
        osmLayers: LayerConfig[],
        bounds: Store<BBox>,
        zoom: Store<number>,
        featureSwitches: FeatureSwitchState
    ): OverpassFeatureSource | undefined {
        if (osmLayers.length == 0) {
            return undefined
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

    public async downloadAll() {
        console.log("Downloading all data")
        await Promise.all(this.supportsForceDownload.map((i) => i.updateAsync()))
        console.log("Done")
    }
}
