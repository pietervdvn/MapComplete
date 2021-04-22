import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import State from "../../State";
import Hash from "../Web/Hash";
import MetaTagging from "../MetaTagging";
import ExtractRelations from "../Osm/ExtractRelations";

export default class MetaTaggingFeatureSource implements FeatureSource {
    features: UIEventSource<{ feature: any; freshness: Date }[]> = new UIEventSource<{feature: any; freshness: Date}[]>(undefined);
    
    constructor(source: FeatureSource) {
        const self = this;
        source.features.addCallbackAndRun((featuresFreshness: { feature: any, freshness: Date }[]) => {
                if (featuresFreshness === undefined) {
                    return;
                }
                featuresFreshness.forEach(featureFresh => {
                    const feature = featureFresh.feature;
                    
                    if (Hash.hash.data === feature.properties.id) {
                        State.state.selectedElement.setData(feature);
                    }
                })

                MetaTagging.addMetatags(featuresFreshness, State.state.knownRelations.data, State.state.layoutToUse.data.layers);
                self.features.setData(featuresFreshness);
        });
    }
    
}