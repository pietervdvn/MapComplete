import FeatureSource from "../FeatureSource";
import {UIEventSource} from "../../UIEventSource";
import {ElementStorage} from "../../ElementStorage";

/**
 * Makes sure that every feature is added to the ElementsStorage, so that the tags-eventsource can be retrieved
 */
export default class RegisteringAllFromFeatureSourceActor {
    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]>;
    public readonly name;

    constructor(source: FeatureSource, allElements: ElementStorage) {
        this.features = source.features;
        this.name = "RegisteringSource of " + source.name;
        this.features.addCallbackAndRunD(features => {
            for (const feature of features) {
                allElements.addOrGetElement(feature.feature)
            }
        })
    }

}