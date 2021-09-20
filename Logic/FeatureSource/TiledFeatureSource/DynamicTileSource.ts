/***
 * A tiled source which dynamically loads the required tiles
 */
import State from "../../../State";
import FilteredLayer from "../../../Models/FilteredLayer";
import {FeatureSourceForLayer} from "../FeatureSource";
import {Utils} from "../../../Utils";
import {UIEventSource} from "../../UIEventSource";
import Loc from "../../../Models/Loc";

export default class DynamicTileSource {
    private readonly _loadedTiles = new Set<number>();
    
    public readonly existingTiles: Map<number, Map<number, FeatureSourceForLayer>> = new Map<number, Map<number, FeatureSourceForLayer>>()

    constructor(
        layer: FilteredLayer,
        zoomlevel: number,
        constructTile: (xy: [number, number]) => FeatureSourceForLayer,
        state: {
            locationControl: UIEventSource<Loc>
            leafletMap: any
        }
    ) {
        state = State.state
        const self = this;
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
                if(needed.length === 0){
                    return undefined
                }
                return needed
            }
            , [layer.isDisplayed, state.leafletMap]).stabilized(250);
        
        neededTiles.addCallbackAndRunD(neededIndexes => {
            for (const neededIndex of neededIndexes) {
                self._loadedTiles.add(neededIndex)
                const xy = Utils.tile_from_index(zoomlevel, neededIndex)
                const src = constructTile(xy)
                let xmap = self.existingTiles.get(xy[0])
                if(xmap === undefined){
                   xmap =  new Map<number, FeatureSourceForLayer>()
                   self.existingTiles.set(xy[0], xmap) 
                }
            xmap.set(xy[1], src)
            }
        })


    }

}