import FilteredLayer from "../../../Models/FilteredLayer";
import {FeatureSourceForLayer, Tiled} from "../FeatureSource";
import {UIEventSource} from "../../UIEventSource";
import TileHierarchy from "./TileHierarchy";
import {Tiles} from "../../../Models/TileRange";
import {BBox} from "../../BBox";

/***
 * A tiled source which dynamically loads the required tiles at a fixed zoom level
 */
export default class DynamicTileSource implements TileHierarchy<FeatureSourceForLayer & Tiled> {
    public readonly loadedTiles: Map<number, FeatureSourceForLayer & Tiled>;
    private readonly _loadedTiles = new Set<number>();

    constructor(
        layer: FilteredLayer,
        zoomlevel: number,
        constructTile: (zxy: [number, number, number]) => (FeatureSourceForLayer & Tiled),
        state: {
            currentBounds: UIEventSource<BBox>;
            locationControl?: UIEventSource<{zoom?: number}>
        }
    ) {
        const self = this;

        this.loadedTiles = new Map<number, FeatureSourceForLayer & Tiled>()
        const neededTiles = state.currentBounds.map(
            bounds => {
                if (bounds === undefined) {
                    // We'll retry later
                    return undefined
                }
                
                if (!layer.isDisplayed.data && !layer.layerDef.forceLoad) {
                    // No need to download! - the layer is disabled
                    return undefined;
                }

                if (state.locationControl?.data?.zoom !== undefined && state.locationControl.data.zoom < layer.layerDef.minzoom) {
                    // No need to download! - the layer is disabled
                    return undefined;
                }

                const tileRange = Tiles.TileRangeBetween(zoomlevel, bounds.getNorth(), bounds.getEast(), bounds.getSouth(), bounds.getWest())
                if (tileRange.total > 10000) {
                    console.error("Got a really big tilerange, bounds and location might be out of sync")
                    return undefined
                }

                const needed = Tiles.MapRange(tileRange, (x, y) => Tiles.tile_index(zoomlevel, x, y)).filter(i => !self._loadedTiles.has(i))
                if (needed.length === 0) {
                    return undefined
                }
                return needed
            }
            , [layer.isDisplayed, state.locationControl]).stabilized(250);

        neededTiles.addCallbackAndRunD(neededIndexes => {
            console.log("Tiled geojson source ", layer.layerDef.id, " needs", neededIndexes)
            if (neededIndexes === undefined) {
                return;
            }
            for (const neededIndex of neededIndexes) {
                self._loadedTiles.add(neededIndex)
                const src = constructTile(Tiles.tile_from_index(neededIndex))
                if (src !== undefined) {
                    self.loadedTiles.set(neededIndex, src)
                }
            }
        })


    }


}

