import FeatureSource from "../FeatureSource";
import { Store } from "../../UIEventSource";
import { ElementStorage } from "../../ElementStorage";
import { Feature } from "geojson";

/**
 * Makes sure that every feature is added to the ElementsStorage, so that the tags-eventsource can be retrieved
 */
export default class RegisteringAllFromFeatureSourceActor {
    public readonly features: Store<Feature[]>

    constructor(source: FeatureSource, allElements: ElementStorage) {
        this.features = source.features
        this.features.addCallbackAndRunD((features) => {
            for (const feature of features) {
                allElements.addOrGetElement(<any> feature)
            }
        })
    }
}
