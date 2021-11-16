/***
 * Saves all the features that are passed in to localstorage, so they can be retrieved on the next run
 *
 * Technically, more an Actor then a featuresource, but it fits more neatly this ay
 */
import FeatureSource, {Tiled} from "../FeatureSource";
import {Tiles} from "../../../Models/TileRange";
import {IdbLocalStorage} from "../../Web/IdbLocalStorage";
import {UIEventSource} from "../../UIEventSource";
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig";
import {BBox} from "../../BBox";
import SimpleFeatureSource from "../Sources/SimpleFeatureSource";
import FilteredLayer from "../../../Models/FilteredLayer";

export default class SaveTileToLocalStorageActor {
    private readonly visitedTiles: UIEventSource<Map<number, Date>>
    private readonly _layer: LayerConfig;
    private readonly _flayer : FilteredLayer
    private readonly initializeTime = new Date()

    constructor(layer: FilteredLayer) {
        this._flayer = layer
        this._layer = layer.layerDef
        this.visitedTiles = IdbLocalStorage.Get("visited_tiles_" + this._layer.id, 
            {defaultValue: new Map<number, Date>(), })
        this.visitedTiles.stabilized(100).addCallbackAndRunD(tiles => {
            for (const key of Array.from(tiles.keys())) {
                const tileFreshness = tiles.get(key)

                const toOld = (this.initializeTime.getTime() -  tileFreshness.getTime()) > 1000 * this._layer.maxAgeOfCache
                if(toOld){
                    // Purge this tile
                    this.SetIdb(key, undefined)
                    console.debug("Purging tile",this._layer.id,key)         
                    tiles.delete(key)
                }
            }
            this.visitedTiles.ping()
            return true;
        })
    }
    
    public LoadTilesFromDisk(currentBounds: UIEventSource<BBox>, 
                       registerFreshness: (tileId: number, freshness: Date) => void,
                       registerTile: ((src: FeatureSource & Tiled ) => void)){
        const self = this;
        this.visitedTiles.addCallbackD(tiles => {
            if(tiles.size === 0){
                // We don't do anything yet as probably not yet loaded from disk
                // We'll unregister later on
                return;
            }
            for (const key of Array.from(tiles.keys())) {
                const tileFreshness = tiles.get(key)
                if(tileFreshness > self.initializeTime){
                    // This tile is loaded by another source
                    continue
                }
                registerFreshness(key, tileFreshness)
                
                const tileBbox = BBox.fromTileIndex(key)
                currentBounds.addCallbackAndRunD(bbox => {
                    if(bbox.overlapsWith(tileBbox)){
                        // The current tile should be loaded from disk
                        this.GetIdb(key).then((features:{feature: any, freshness: Date}[] ) => {
                            console.log("Loaded tile "+self._layer.id+"_"+key+" from disk")
                            const src = new SimpleFeatureSource(self._flayer, key, new UIEventSource<{feature: any; freshness: Date}[]>(features))
                            registerTile(src)
                        })
                        return true; // only load once: unregister
                    }
                })
                
            }
            
            return true; // Remove the callback
            
        })
    }

    private SetIdb(tileIndex, data){
        IdbLocalStorage.SetDirectly(this._layer.id+"_"+tileIndex, data)
    }

    private GetIdb(tileIndex){
      return IdbLocalStorage.GetDirectly(this._layer.id+"_"+tileIndex)
    }
    
    public addTile(tile: FeatureSource & Tiled){
        const self = this
        tile.features.addCallbackAndRunD(features => {
            const now = new Date()

            if (features.length > 0) {
               self.SetIdb(tile.tileIndex, features)
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