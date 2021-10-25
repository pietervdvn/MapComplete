/***
 * Saves all the features that are passed in to localstorage, so they can be retrieved on the next run
 *
 * Technically, more an Actor then a featuresource, but it fits more neatly this ay
 */
import {FeatureSourceForLayer} from "../FeatureSource";
import {Tiles} from "../../../Models/TileRange";

export default class SaveTileToLocalStorageActor {
    public static readonly storageKey: string = "cached-features";
    public static readonly formatVersion: string = "2"

    constructor(source: FeatureSourceForLayer, tileIndex: number) {

        source.features.addCallbackAndRunD(features => {
            const key = `${SaveTileToLocalStorageActor.storageKey}-${source.layer.layerDef.id}-${tileIndex}`
            const now = new Date()

            try {
                if (features.length > 0) {
                    localStorage.setItem(key, JSON.stringify(features));
                }
                // We _still_ write the time to know that this tile is empty!
                SaveTileToLocalStorageActor.MarkVisited(source.layer.layerDef.id, tileIndex, now)
            } catch (e) {
                console.warn("Could not save the features to local storage:", e)
            }
        })
    }


    public static MarkVisited(layerId: string, tileId: number, freshness: Date) {
        const key = `${SaveTileToLocalStorageActor.storageKey}-${layerId}-${tileId}`
        try {
            localStorage.setItem(key + "-time", JSON.stringify(freshness.getTime()))
            localStorage.setItem(key + "-format", SaveTileToLocalStorageActor.formatVersion)
        } catch (e) {
            console.error("Could not mark tile ", key, "as visited")
        }
    }

   public static poison(layers: string[], lon: number, lat: number) {
        for (let z = 0; z < 25; z++) {

            const {x, y} = Tiles.embedded_tile(lat, lon, z)
            const tileId = Tiles.tile_index(z, x, y)

            for (const layerId of layers) {

                const key = `${SaveTileToLocalStorageActor.storageKey}-${layerId}-${tileId}`
                localStorage.removeItem(key + "-time");
                localStorage.removeItem(key + "-format")
                localStorage.removeItem(key)
            }
        }

    }
}