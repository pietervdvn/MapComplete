import FilteredLayer from "../../../Models/FilteredLayer";
import {FeatureSourceForLayer, Tiled} from "../FeatureSource";
import {UIEventSource} from "../../UIEventSource";
import Loc from "../../../Models/Loc";
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
            locationControl: UIEventSource<Loc>
        }
    ) {
        const self = this;

        this.loadedTiles = new Map<number, FeatureSourceForLayer & Tiled>()
        const neededTiles = state.locationControl.map(
            location => {
                if (!layer.isDisplayed.data) {
                    // No need to download! - the layer is disabled
                    return undefined;
                }

                if (location.zoom < layer.layerDef.minzoom) {
                    // No need to download! - the layer is disabled
                    return undefined;
                }

                // Yup, this is cheating to just get the bounds here
                const bounds = state.currentBounds.data
                if (bounds === undefined) {
                    // We'll retry later
                    return undefined
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
            , [layer.isDisplayed, state.currentBounds]).stabilized(250);

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

