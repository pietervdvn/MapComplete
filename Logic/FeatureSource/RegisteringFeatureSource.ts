import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import State from "../../State";

export default class RegisteringFeatureSource implements FeatureSource {
    features: UIEventSource<{ feature: any; freshness: Date }[]>;

    constructor(source: FeatureSource) {
        this.features = source.features;
        this.features.addCallbackAndRun(features => {
            for (const feature of features ?? []) {
                if (!State.state.allElements.has(feature.feature.properties.id)) {
                    State.state.allElements.addOrGetElement(feature.feature)
                }
            }
        })
    }

}