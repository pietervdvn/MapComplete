
import State from "../../../State";
import FilteredLayer from "../../../Models/FilteredLayer";
import {FeatureSourceForLayer, Tiled} from "../FeatureSource";
import {Utils} from "../../../Utils";
import {UIEventSource} from "../../UIEventSource";
import Loc from "../../../Models/Loc";
import TileHierarchy from "./TileHierarchy";

/***
 * A tiled source which dynamically loads the required tiles at a fixed zoom level
 */
export default class DynamicTileSource implements TileHierarchy<FeatureSourceForLayer & Tiled> {
    private readonly _loadedTiles = new Set<number>();

    public readonly loadedTiles: Map<number, FeatureSourceForLayer & Tiled>;

    constructor(
        layer: FilteredLayer,
        zoomlevel: number,
        constructTile: (zxy: [number, number, number]) => (FeatureSourceForLayer & Tiled),
        state: {
            locationControl: UIEventSource<Loc>
            leafletMap: any
        }
    ) {
        state = State.state
        const self = this;

        this.loadedTiles = new Map<number,FeatureSourceForLayer & Tiled>()
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
                const bounds = state.leafletMap.data?.getBounds()
                if (bounds === undefined) {
                    // We'll retry later
                    return undefined
                }
                const tileRange = Utils.TileRangeBetween(zoomlevel, bounds.getNorth(), bounds.getEast(), bounds.getSouth(), bounds.getWest())

                const needed = Utils.MapRange(tileRange, (x, y) => Utils.tile_index(zoomlevel, x, y)).filter(i => !self._loadedTiles.has(i))
                if (needed.length === 0) {
                    return undefined
                }
                return needed
            }
            , [layer.isDisplayed, state.leafletMap]).stabilized(250);

        neededTiles.addCallbackAndRunD(neededIndexes => {
            console.log("Tiled geojson source ",layer.layerDef.id," needs", neededIndexes)
            if (neededIndexes === undefined) {
                return;
            }
            for (const neededIndex of neededIndexes) {
                self._loadedTiles.add(neededIndex)
                const src = constructTile( Utils.tile_from_index(neededIndex))
                if(src !== undefined){
                    self.loadedTiles.set(neededIndex, src)
                }
            }
        })


    }


}

