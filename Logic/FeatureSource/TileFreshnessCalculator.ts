import {Tiles} from "../../Models/TileRange";

export default class TileFreshnessCalculator {

    /**
     * All the freshnesses per tile index
     * @private
     */
    private readonly freshnesses = new Map<number, Date>();

    /**
     * Marks that some data got loaded for this layer
     * @param tileId
     * @param freshness
     */
    public addTileLoad(tileId: number, freshness: Date){
        const existingFreshness = this.freshnessFor(...Tiles.tile_from_index(tileId))
        if(existingFreshness >= freshness){
            return;
        }
        this.freshnesses.set(tileId, freshness)
       
        
        // Do we have freshness for the neighbouring tiles? If so, we can mark the tile above as loaded too!
        let [z, x, y] = Tiles.tile_from_index(tileId)
        if(z === 0){
            return;
        }
        x = x - (x % 2) // Make the tiles always even
        y = y - (y % 2)
        
        const ul = this.freshnessFor(z, x, y)?.getTime()
        if(ul === undefined){
            return
        }
        const ur = this.freshnessFor(z, x + 1, y)?.getTime()
        if(ur === undefined){
            return
        }
        const ll = this.freshnessFor(z, x, y + 1)?.getTime()
        if(ll === undefined){
            return
        }
        const lr = this.freshnessFor(z, x + 1, y + 1)?.getTime()
        if(lr === undefined){
            return
        }

        const leastFresh = Math.min(ul, ur, ll, lr)
        const date = new Date()
        date.setTime(leastFresh)
        this.addTileLoad(
            Tiles.tile_index(z - 1, Math.floor(x / 2), Math.floor(y / 2)),
                date
        )
        
    }
    
    public freshnessFor(z: number, x: number, y:number): Date {
        if(z < 0){
            return undefined
        }
        const tileId = Tiles.tile_index(z, x, y)
        if(this.freshnesses.has(tileId)) {
            return this.freshnesses.get(tileId)
        }
        // recurse up
        return this.freshnessFor(z - 1, Math.floor(x /2), Math.floor(y / 2))
        
    }

}