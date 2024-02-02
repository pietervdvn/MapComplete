import { Store, Stores } from "../../UIEventSource"
import { Tiles } from "../../../Models/TileRange"
import { BBox } from "../../BBox"
import { FeatureSource } from "../FeatureSource"
import FeatureSourceMerger from "../Sources/FeatureSourceMerger"


/***
 * A tiled source which dynamically loads the required tiles at a fixed zoom level.
 * A single featureSource will be initialized for every tile in view; which will later be merged into this featureSource
 */
export default class DynamicTileSource<Src extends FeatureSource = FeatureSource> extends FeatureSourceMerger<Src> {
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
        },
    ) {
        super()
        const loadedTiles = new Set<number>()
        const neededTiles: Store<number[]> = Stores.ListStabilized(
            mapProperties.bounds
                .mapD(
                    (bounds) => {
                        if (options?.isActive && !options?.isActive.data) {
                            return undefined
                        }

                        if (mapProperties.zoom.data < minzoom) {
                            return undefined
                        }
                        const z = Math.floor(zoomlevel.data)
                        const tileRange = Tiles.TileRangeBetween(
                            z,
                            bounds.getNorth(),
                            bounds.getEast(),
                            bounds.getSouth(),
                            bounds.getWest(),
                        )
                        if (tileRange.total > 500) {
                            console.warn(
                                "Got a really big tilerange, bounds and location might be out of sync",
                            )
                            return undefined
                        }

                        const needed = Tiles.MapRange(tileRange, (x, y) =>
                            Tiles.tile_index(z, x, y),
                        ).filter((i) => !loadedTiles.has(i))
                        if (needed.length === 0) {
                            return undefined
                        }
                        return needed
                    },
                    [options?.isActive, mapProperties.zoom],
                )
                .stabilized(250),
        )

        neededTiles.addCallbackAndRunD((neededIndexes) => {
            for (const neededIndex of neededIndexes) {
                loadedTiles.add(neededIndex)
                super.addSource(constructSource(neededIndex))
            }
        })
    }
}


