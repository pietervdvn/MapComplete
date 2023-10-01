import { Utils } from "../../../Utils"
import OsmToGeoJson from "osmtogeojson"
import { ImmutableStore, Store, UIEventSource } from "../../UIEventSource"
import { Tiles } from "../../../Models/TileRange"
import { BBox } from "../../BBox"
import { TagsFilter } from "../../Tags/TagsFilter"
import { Feature } from "geojson"
import FeatureSourceMerger from "../Sources/FeatureSourceMerger"
import OsmObjectDownloader from "../../Osm/OsmObjectDownloader"
import FullNodeDatabaseSource from "../TiledFeatureSource/FullNodeDatabaseSource"

/**
 * If a tile is needed (requested via the UIEventSource in the constructor), will download the appropriate tile and pass it via 'handleTile'
 */
export default class OsmFeatureSource extends FeatureSourceMerger {
    private readonly _bounds: Store<BBox>
    private readonly isActive: Store<boolean>
    private readonly _backend: string
    private readonly allowedTags: TagsFilter
    private options: {
        bounds: Store<BBox>
        readonly allowedFeatures: TagsFilter
        backend?: "https://api.openstreetmap.org/" | string
        /**
         * If given: this featureSwitch will not update if the store contains 'false'
         */
        isActive?: Store<boolean>
        patchRelations?: true | boolean
        fullNodeDatabase?: FullNodeDatabaseSource
    }

    public readonly isRunning: UIEventSource<boolean> = new UIEventSource<boolean>(false)

    private readonly _downloadedTiles: Set<number> = new Set<number>()
    private readonly _downloadedData: Feature[][] = []
    private readonly _patchRelations: boolean
    /**
     * Downloads data directly from the OSM-api within the given bounds.
     * All features which match the TagsFilter 'allowedFeatures' are kept and converted into geojson
     */
    constructor(options: {
        bounds: Store<BBox>
        readonly allowedFeatures: TagsFilter
        backend?: "https://api.openstreetmap.org/" | string
        /**
         * If given: this featureSwitch will not update if the store contains 'false'
         */
        isActive?: Store<boolean>
        patchRelations?: true | boolean
        fullNodeDatabase?: FullNodeDatabaseSource
    }) {
        super()
        this.options = options
        this._bounds = options.bounds
        this.allowedTags = options.allowedFeatures
        this.isActive = options.isActive ?? new ImmutableStore(true)
        this._backend = options.backend ?? "https://api.openstreetmap.org"
        this._bounds.addCallbackAndRunD((bbox) => this.loadData(bbox))
        this._patchRelations = options?.patchRelations ?? true
    }

    private async loadData(bbox: BBox) {
        if (this.isActive?.data === false) {
            return
        }

        const z = 15
        const neededTiles = Tiles.tileRangeFrom(bbox, z)

        if (neededTiles.total == 0) {
            return
        }

        if (neededTiles.total > 100) {
            console.error("Too much tiles to download!")
            return
        }

        this.isRunning.setData(true)
        try {
            const tileNumbers = Tiles.MapRange(neededTiles, (x, y) => {
                return Tiles.tile_index(z, x, y)
            })
            await Promise.all(tileNumbers.map((i) => this.LoadTile(...Tiles.tile_from_index(i))))
        } catch (e) {
            console.error(e)
        } finally {
            this.isRunning.setData(false)
        }
    }

    private registerFeatures(features: Feature[]): void {
        this._downloadedData.push(features)
        super.addData(this._downloadedData)
    }

    /**
     * The requested tile might only contain part of the relation.
     *
     * This method will download the full relation and return it as geojson if it was incomplete.
     * If the feature is already complete (or is not a relation), the feature will be returned as is
     */
    private async patchIncompleteRelations(
        feature: { properties: { id: string } },
        originalJson: { elements: { type: "node" | "way" | "relation"; id: number }[] }
    ): Promise<any> {
        if (!feature.properties.id.startsWith("relation") || !this._patchRelations) {
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
            const dfeature = await new OsmObjectDownloader(this._backend).DownloadObjectAsync(
                feature.properties.id
            )
            if (dfeature === "deleted") {
                console.warn(
                    "This relation has been deleted in the meantime: ",
                    feature.properties.id
                )
                return
            }
            return dfeature.asGeoJson()
        }
        return feature
    }

    private async LoadTile(z: number, x: number, y: number): Promise<void> {
        if (z >= 22) {
            throw "This is an absurd high zoom level"
        }

        if (z < 15) {
            throw `Zoom ${z} is too much for OSM to handle! Use a higher zoom level!`
        }
        const index = Tiles.tile_index(z, x, y)
        if (this._downloadedTiles.has(index)) {
            return
        }
        console.log("OsmFeatureSource: loading ", z, x, y, "from", this._backend)
        this._downloadedTiles.add(index)

        const bbox = BBox.fromTile(z, x, y)
        const url = `${this._backend}/api/0.6/map?bbox=${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}`

        let error = undefined
        try {
            const osmJson = await Utils.downloadJsonCached(url, 2000)
            try {
                this.options?.fullNodeDatabase?.handleOsmJson(osmJson, z, x, y)
                let features = <Feature<any, { id: string }>[]>OsmToGeoJson(
                    osmJson,
                    // @ts-ignore
                    {
                        flatProperties: true,
                    }
                ).features

                // The geojson contains _all_ features at the given location
                // We only keep what is needed

                features = features.filter((feature) =>
                    this.allowedTags.matchesProperties(feature.properties)
                )

                for (let i = 0; i < features.length; i++) {
                    features[i] = await this.patchIncompleteRelations(features[i], osmJson)
                }
                features = Utils.NoNull(features)
                features.forEach((f) => {
                    f.properties["_backend"] = this._backend
                })
                this.registerFeatures(features)
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
                e === "rate limited" ? "; stopping now" : "; retrying with smaller bounds"
            )
            if (e === "rate limited") {
                return
            }
            await Promise.all([
                this.LoadTile(z + 1, x * 2, y * 2),
                this.LoadTile(z + 1, 1 + x * 2, y * 2),
                this.LoadTile(z + 1, x * 2, 1 + y * 2),
                this.LoadTile(z + 1, 1 + x * 2, 1 + y * 2),
            ])
        }

        if (error !== undefined) {
            throw error
        }
    }
}
