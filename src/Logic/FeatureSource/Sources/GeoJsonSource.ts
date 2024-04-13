import { Store, UIEventSource } from "../../UIEventSource"
import { Utils } from "../../../Utils"
import { FeatureSource } from "../FeatureSource"
import { BBox } from "../../BBox"
import { GeoOperations } from "../../GeoOperations"
import { Feature } from "geojson"
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
import { Tiles } from "../../../Models/TileRange"

export default class GeoJsonSource implements FeatureSource {
    private readonly _features: UIEventSource<Feature[]> = new UIEventSource<Feature[]>(undefined)
    public readonly features: Store<Feature[]> = this._features
    private readonly seenids: Set<string>
    private readonly idKey?: string
    private readonly url: string
    private readonly layer: LayerConfig
    private _isDownloaded = false
    private currentlyRunning: Promise<Feature[]>

    /**
     * Fetches a geojson-file somewhere and passes it along as geojson source
     */
    public constructor(
        layer: LayerConfig,
        options?: {
            zxy?: number | [number, number, number] | BBox
            featureIdBlacklist?: Set<string>
            isActive?: Store<boolean>
        }
    ) {
        if (layer.source.geojsonZoomLevel !== undefined && options?.zxy === undefined) {
            throw "Dynamic layers are not supported. Use 'DynamicGeoJsonTileSource instead"
        }

        this.idKey = layer.source.idKey
        this.seenids = options?.featureIdBlacklist ?? new Set<string>()
        let url = layer.source.geojsonSource.replace("{layer}", layer.id)
        this.layer = layer
        let zxy = options?.zxy
        if (zxy !== undefined) {
            let tile_bbox: BBox
            if (typeof zxy === "number") {
                zxy = Tiles.tile_from_index(zxy)
            }
            if (zxy instanceof BBox) {
                tile_bbox = zxy
            } else {
                const [z, x, y] = zxy
                tile_bbox = BBox.fromTile(z, x, y)
                url = url
                    .replace("{z}", "" + z)
                    .replace("{x}", "" + x)
                    .replace("{y}", "" + y)
            }
            let bounds: Record<"minLat" | "maxLat" | "minLon" | "maxLon", number> = tile_bbox
            if (layer.source.mercatorCrs) {
                bounds = tile_bbox.toMercator()
            }

            url = url
                .replace("{y_min}", "" + bounds.minLat)
                .replace("{y_max}", "" + bounds.maxLat)
                .replace("{x_min}", "" + bounds.minLon)
                .replace("{x_max}", "" + bounds.maxLon)
        }
        this.url = url

        if (options?.isActive !== undefined) {
            options.isActive.addCallbackAndRunD(async (active) => {
                if (!active) {
                    return
                }
                this.updateAsync()
                return true // data is loaded, we can safely unregister
            })
        } else {
            this.updateAsync()
        }
    }

    public async updateAsync(): Promise<void> {
        if (!this.currentlyRunning) {
            this.currentlyRunning = this.LoadJSONFrom()
        }
        await this.currentlyRunning
    }

    /**
     * Init the download, write into the specified event source for the given layer.
     * Note this method caches the requested geojson for five minutes
     */
    private async LoadJSONFrom(options?: { maxCacheAgeSec?: number | 300 }): Promise<Feature[]> {
        if (this._isDownloaded) {
            return
        }
        const url = this.url
        try {
            const cacheAge = (options?.maxCacheAgeSec ?? 300) * 1000
            let json = <{ features: Feature[] }>await Utils.downloadJsonCached(url, cacheAge)

            if (json.features === undefined || json.features === null) {
                json.features = []
            }

            if (this.layer.source.mercatorCrs) {
                json = GeoOperations.GeoJsonToWGS84(json)
            }

            const newFeatures: Feature[] = []
            let i = 0
            for (const feature of json.features) {
                if (feature.geometry.type === "Point") {
                    // See https://github.com/maproulette/maproulette-backend/issues/242
                    feature.geometry.coordinates = feature.geometry.coordinates.map(Number)
                }
                const props = feature.properties
                for (const key in props) {
                    if (props[key] === null) {
                        delete props[key]
                    }

                    if (typeof props[key] !== "string") {
                        // Make sure all the values are string, it crashes stuff otherwise
                        props[key] = JSON.stringify(props[key])
                    }
                }

                if (this.idKey !== undefined) {
                    props.id = props[this.idKey]
                }

                if (props.id === undefined) {
                    props.id = url + "/" + i
                    feature.id = url + "/" + i
                    i++
                }
                if (this.seenids.has(props.id)) {
                    continue
                }
                this.seenids.add(props.id)
                newFeatures.push(feature)
            }

            this._features.setData(newFeatures)
            this._isDownloaded = true
            return newFeatures
        } catch (e) {
            console.warn("Could not load ", url, "due to", e)
        }
    }
}
