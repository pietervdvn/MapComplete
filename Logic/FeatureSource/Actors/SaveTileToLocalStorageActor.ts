/***
 * Saves all the features that are passed in to localstorage, so they can be retrieved on the next run
 *
 * Technically, more an Actor then a featuresource, but it fits more neatly this ay
 */
import FeatureSource, {Tiled} from "../FeatureSource";
import {Tiles} from "../../../Models/TileRange";
import {IdbLocalStorage} from "../../Web/IdbLocalStorage";
import {UIEventSource} from "../../UIEventSource";

export default class SaveTileToLocalStorageActor {
    private readonly visitedTiles: UIEventSource<Map<number, Date>>
    private readonly _layerId: string;
    static storageKey: string = "";

    constructor(layerId: string) {
        this._layerId = layerId;
        this.visitedTiles = IdbLocalStorage.Get("visited_tiles_" + layerId, 
            {defaultValue: new Map<number, Date>(), })
    }

    public loadAvailableTiles(){
        this.visitedTiles.addCallbackAndRunD()
    }

    public addTile(tile: FeatureSource & Tiled){
        tile.features.addCallbackAndRunD(features => {
            const now = new Date()

            if (features.length > 0) {
                IdbLocalStorage.SetDirectly(this._layerId+"_"+tile.tileIndex, features)
            }
            // We _still_ write the time to know that this tile is empty!
            this.MarkVisited(tile.tileIndex, now)
        })
    }
    
    public poison(lon: number, lat: number) {
        for (let z = 0; z < 25; z++) {
            const {x, y} = Tiles.embedded_tile(lat, lon, z)
            const tileId = Tiles.tile_index(z, x, y)
            this.visitedTiles.data.delete(tileId)
        }

    }

    public MarkVisited(tileId: number, freshness: Date) {
        this.visitedTiles.data.set(tileId, freshness)
        this.visitedTiles.ping()
    }
}