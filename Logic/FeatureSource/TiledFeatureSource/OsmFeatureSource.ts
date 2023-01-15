import { Utils } from "../../../Utils"
import * as OsmToGeoJson from "osmtogeojson"
import StaticFeatureSource from "../Sources/StaticFeatureSource"
import PerLayerFeatureSourceSplitter from "../PerLayerFeatureSourceSplitter"
import { Store, UIEventSource } from "../../UIEventSource"
import FilteredLayer from "../../../Models/FilteredLayer"
import { FeatureSourceForLayer, Tiled } from "../FeatureSource"
import { Tiles } from "../../../Models/TileRange"
import { BBox } from "../../BBox"
import LayoutConfig from "../../../Models/ThemeConfig/LayoutConfig"
import { Or } from "../../Tags/Or"
import { TagsFilter } from "../../Tags/TagsFilter"
import { OsmObject } from "../../Osm/OsmObject"
import { FeatureCollection } from "@turf/turf"

/**
 * If a tile is needed (requested via the UIEventSource in the constructor), will download the appropriate tile and pass it via 'handleTile'
 */
export default class OsmFeatureSource {
    public readonly isRunning: UIEventSource<boolean> = new UIEventSource<boolean>(false)
    public readonly downloadedTiles = new Set<number>()
    public rawDataHandlers: ((osmJson: any, tileId: number) => void)[] = []
    private readonly _backend: string
    private readonly filteredLayers: Store<FilteredLayer[]>
    private readonly handleTile: (fs: FeatureSourceForLayer & Tiled) => void
    private isActive: Store<boolean>
    private options: {
        handleTile: (tile: FeatureSourceForLayer & Tiled) => void
        isActive: Store<boolean>
        neededTiles: Store<number[]>
        markTileVisited?: (tileId: number) => void
    }
    private readonly allowedTags: TagsFilter

    /**
     *
     * @param options: allowedFeatures is normally calculated from the layoutToUse
     */
    constructor(options: {
        handleTile: (tile: FeatureSourceForLayer & Tiled) => void
        isActive: Store<boolean>
        neededTiles: Store<number[]>
        state: {
            readonly filteredLayers: UIEventSource<FilteredLayer[]>
            readonly osmConnection: {
                Backend(): string
            }
            readonly layoutToUse?: LayoutConfig
        }
        readonly allowedFeatures?: TagsFilter
        markTileVisited?: (tileId: number) => void
    }) {
        this.options = options
        this._backend = options.state.osmConnection.Backend()
        this.filteredLayers = options.state.filteredLayers.map((layers) =>
            layers.filter((layer) => layer.layerDef.source.geojsonSource === undefined)
        )
        this.handleTile = options.handleTile
        this.isActive = options.isActive
        const self = this
        options.neededTiles.addCallbackAndRunD((neededTiles) => {
            self.Update(neededTiles)
        })

        const neededLayers = (options.state.layoutToUse?.layers ?? [])
            .filter((layer) => !layer.doNotDownload)
            .filter(
                (layer) => layer.source.geojsonSource === undefined || layer.source.isOsmCacheLayer
            )
        this.allowedTags =
            options.allowedFeatures ?? new Or(neededLayers.map((l) => l.source.osmTags))
    }

    private async Update(neededTiles: number[]) {
        if (this.options.isActive?.data === false) {
            return
        }

        neededTiles = neededTiles.filter((tile) => !this.downloadedTiles.has(tile))

        if (neededTiles.length == 0) {
            return
        }

        this.isRunning.setData(true)
        try {
            for (const neededTile of neededTiles) {
                this.downloadedTiles.add(neededTile)
                await this.LoadTile(...Tiles.tile_from_index(neededTile))
            }
        } catch (e) {
            console.error(e)
        } finally {
            this.isRunning.setData(false)
        }
    }

    /**
     * The requested tile might only contain part of the relation.
     *
     * This method will download the full relation and return it as geojson if it was incomplete.
     * If the feature is already complete (or is not a relation), the feature will be returned
     */
    private async patchIncompleteRelations(
        feature: { properties: { id: string } },
        originalJson: { elements: { type: "node" | "way" | "relation"; id: number }[] }
    ): Promise<any> {
        if (!feature.properties.id.startsWith("relation")) {
            return feature
        }
        const relationSpec = originalJson.elements.find(
            (f) => "relation/" + f.id === feature.properties.id
        )
        const members: { type: string; ref: number }[] = relationSpec["members"]
        for (const member of members) {
            const isFound = originalJson.elements.some(
                (f) => f.id === member.ref && f.type === member.type
            )
            if (isFound) {
                continue
            }

            // This member is missing. We redownload the entire relation instead
            console.debug("Fetching incomplete relation " + feature.properties.id)
            return (await OsmObject.DownloadObjectAsync(feature.properties.id)).asGeoJson()
        }
        return feature
    }

    private async LoadTile(z, x, y): Promise<void> {
        if (z >= 22) {
            throw "This is an absurd high zoom level"
        }

        if (z < 14) {
            throw `Zoom ${z} is too much for OSM to handle! Use a higher zoom level!`
        }

        const bbox = BBox.fromTile(z, x, y)
        const url = `${this._backend}/api/0.6/map?bbox=${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}`

        let error = undefined
        try {
            const osmJson = await Utils.downloadJson(url)
            try {
                console.log("Got tile", z, x, y, "from the osm api")
                this.rawDataHandlers.forEach((handler) =>
                    handler(osmJson, Tiles.tile_index(z, x, y))
                )
                const geojson = <FeatureCollection<any, { id: string }>>OsmToGeoJson(
                    osmJson,
                    // @ts-ignore
                    {
                        flatProperties: true,
                    }
                )

                // The geojson contains _all_ features at the given location
                // We only keep what is needed

                geojson.features = geojson.features.filter((feature) =>
                    this.allowedTags.matchesProperties(feature.properties)
                )

                for (let i = 0; i < geojson.features.length; i++) {
                    geojson.features[i] = await this.patchIncompleteRelations(
                        geojson.features[i],
                        osmJson
                    )
                }
                geojson.features.forEach((f) => {
                    f.properties["_backend"] = this._backend
                })

                const index = Tiles.tile_index(z, x, y)
                new PerLayerFeatureSourceSplitter(
                    this.filteredLayers,
                    this.handleTile,
                    StaticFeatureSource.fromGeojson(geojson.features),
                    {
                        tileIndex: index,
                    }
                )
                if (this.options.markTileVisited) {
                    this.options.markTileVisited(index)
                }
            } catch (e) {
                console.error(
                    "PANIC: got the tile from the OSM-api, but something crashed handling this tile"
                )
                error = e
            }
        } catch (e) {
            console.error(
                "Could not download tile",
                z,
                x,
                y,
                "due to",
                e,
                "; retrying with smaller bounds"
            )
            if (e === "rate limited") {
                return
            }
            await this.LoadTile(z + 1, x * 2, y * 2)
            await this.LoadTile(z + 1, 1 + x * 2, y * 2)
            await this.LoadTile(z + 1, x * 2, 1 + y * 2)
            await this.LoadTile(z + 1, 1 + x * 2, 1 + y * 2)
        }

        if (error !== undefined) {
            throw error
        }
    }
}
