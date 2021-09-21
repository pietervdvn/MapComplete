/***
 * Saves all the features that are passed in to localstorage, so they can be retrieved on the next run
 *
 * Technically, more an Actor then a featuresource, but it fits more neatly this ay
 */
import {FeatureSourceForLayer} from "../FeatureSource";
import {Utils} from "../../../Utils";

export default class LocalStorageSaverActor {
    public static readonly storageKey: string = "cached-features";

    constructor(source: FeatureSourceForLayer, x: number, y: number, z: number) {
        source.features.addCallbackAndRunD(features => {
            const index = Utils.tile_index(z, x, y)
            const key = `${LocalStorageSaverActor.storageKey}-${source.layer.layerDef.id}-${index}`
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