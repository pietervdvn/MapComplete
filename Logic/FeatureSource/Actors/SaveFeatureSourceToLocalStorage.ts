import { FeatureSource } from "../FeatureSource"
import { Feature } from "geojson"
import TileLocalStorage from "./TileLocalStorage"
import { GeoOperations } from "../../GeoOperations"
import { Utils } from "../../../Utils"

/***
 * Saves all the features that are passed in to localstorage, so they can be retrieved on the next run
 *
 * The data is saved in a tiled way on a fixed zoomlevel and is retrievable per layer.
 *
 * Also see the sibling class
 */
export default class SaveFeatureSourceToLocalStorage {
    constructor(layername: string, zoomlevel: number, features: FeatureSource) {
        const storage = TileLocalStorage.construct<Feature[]>(layername)
        features.features.addCallbackAndRunD((features) => {
            const sliced = GeoOperations.slice(zoomlevel, features)
            sliced.forEach((features, tileIndex) => {
                const src = storage.getTileSource(tileIndex)
                if (Utils.sameList(src.data, features)) {
                    return
                }
                src.setData(features)
            })
        })
    }
}
