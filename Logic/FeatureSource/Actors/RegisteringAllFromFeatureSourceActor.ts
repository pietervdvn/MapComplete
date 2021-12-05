import FeatureSource from "../FeatureSource";
import {UIEventSource} from "../../UIEventSource";
import State from "../../../State";
import ElementsState from "../../State/ElementsState";
import {ElementStorage} from "../../ElementStorage";

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