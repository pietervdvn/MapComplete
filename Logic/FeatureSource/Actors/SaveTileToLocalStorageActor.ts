/***
 * Saves all the features that are passed in to localstorage, so they can be retrieved on the next run
 *
 * Technically, more an Actor then a featuresource, but it fits more neatly this ay
 */
import {FeatureSourceForLayer} from "../FeatureSource";

export default class SaveTileToLocalStorageActor {
    public static readonly storageKey: string = "cached-features";

    constructor(source: FeatureSourceForLayer, tileIndex: number) {
        source.features.addCallbackAndRunD(features => {
            const key = `${SaveTileToLocalStorageActor.storageKey}-${source.layer.layerDef.id}-${tileIndex}`
            const now = new Date().getTime()

            if (features.length == 0) {
                return;
            }

            try {
                localStorage.setItem(key, JSON.stringify(features));
                localStorage.setItem(key + "-time", JSON.stringify(now))
            } catch (e) {
                console.warn("Could not save the features to local storage:", e)
            }
        })


    }


}