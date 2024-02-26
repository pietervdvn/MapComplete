import { Store, Stores } from "../../UIEventSource"
import { Tiles } from "../../../Models/TileRange"
import { BBox } from "../../BBox"
import { FeatureSource, UpdatableFeatureSource } from "../FeatureSource"
import FeatureSourceMerger from "../Sources/FeatureSourceMerger"

/***
 * A tiled source which dynamically loads the required tiles at a fixed zoom level.
 * A single featureSource will be initialized for every tile in view; which will later be merged into this featureSource
 */
export default class DynamicTileSource<
    Src extends FeatureSource = FeatureSource
> extends FeatureSourceMerger<Src> {
    private readonly loadedTiles = new Set<number>()
    private readonly zDiff: number
    private readonly zoomlevel: Store<number>
    private readonly constructSource: (tileIndex: number) => Src
    private readonly bounds: Store<BBox>

    /**
     *
     * @param zoomlevel If {z} is specified in the source, the 'zoomlevel' will be used as zoomlevel to download from
     * @param minzoom Only activate this feature source if zoomed in further then this
     * @param constructSource
     * @param mapProperties
     * @param options
     */
    constructor(
        zoomlevel: Store<number>,
        minzoom: number,
        constructSource: (tileIndex: number) => Src,
        mapProperties: {
            bounds: Store<BBox>
            zoom: Store<number>
        },
        options?: {
            isActive?: Store<boolean>
            zDiff?: number
        }
    ) {
        super()
        this.constructSource = constructSource
        this.zoomlevel = zoomlevel
        this.zDiff = options?.zDiff ?? 0
        this.bounds = mapProperties.bounds

        const neededTiles: Store<number[]> = Stores.ListStabilized(
            mapProperties.bounds
                .mapD(() => {
                    if (options?.isActive && !options?.isActive.data) {
                        return undefined
                    }

                    if (mapProperties.zoom.data < minzoom) {
                        return undefined
                    }
                    return this.getNeededTileIndices()
                }, [options?.isActive, mapProperties.zoom])
                .stabilized(250)
        )

        neededTiles.addCallbackAndRunD((neededIndexes) => this.downloadTiles(neededIndexes))
    }

    protected downloadTiles(neededIndexes: number[]): Src[] {
        const sources: Src[] = []
        for (const neededIndex of neededIndexes) {
            this.loadedTiles.add(neededIndex)
            const src = this.constructSource(neededIndex)
            super.addSource(src)
            sources.push(src)
        }
        return sources
    }

    protected getNeededTileIndices() {
        const bounds = this.bounds.data
        const z = Math.floor(this.zoomlevel.data) + this.zDiff
        const tileRange = Tiles.TileRangeBetween(
            z,
            bounds.getNorth(),
            bounds.getEast(),
            bounds.getSouth(),
            bounds.getWest()
        )
        if (tileRange.total > 500) {
            console.warn("Got a really big tilerange, bounds and location might be out of sync")
            return []
        }
        const needed = Tiles.MapRange(tileRange, (x, y) => Tiles.tile_index(z, x, y)).filter(
            (i) => !this.loadedTiles.has(i)
        )
        if (needed.length === 0) {
            return []
        }
        return needed
    }
}

export class UpdatableDynamicTileSource<Src extends UpdatableFeatureSource = UpdatableFeatureSource>
    extends DynamicTileSource<Src>
    implements UpdatableFeatureSource
{
    constructor(
        zoomlevel: Store<number>,
        minzoom: number,
        constructSource: (tileIndex: number) => Src,
        mapProperties: {
            bounds: Store<BBox>
            zoom: Store<number>
        },
        options?: {
            isActive?: Store<boolean>
            zDiff?: number
        }
    ) {
        super(zoomlevel, minzoom, constructSource, mapProperties, options)
    }

    async updateAsync() {
        const sources = super.downloadTiles(super.getNeededTileIndices())
        await Promise.all(sources.map((src) => src.updateAsync()))
    }
}
