import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import State from "../../State";
import Hash from "../Web/Hash";
import MetaTagging from "../MetaTagging";
import ExtractRelations from "../Osm/ExtractRelations";

export default class MetaTaggingFeatureSource implements FeatureSource {
    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]> = new UIEventSource<{ feature: any; freshness: Date }[]>(undefined);

    public readonly name;

    constructor(allFeaturesSource: FeatureSource, source: FeatureSource, updateTrigger?: UIEventSource<any>) {
        const self = this;
        this.name = "MetaTagging of " + source.name

        function update() {
            const featuresFreshness = source.features.data
            if (featuresFreshness === undefined) {
                return;
            }
            featuresFreshness.forEach(featureFresh => {
                const feature = featureFresh.feature;

                if (Hash.hash.data === feature.properties.id) {
                    State.state.selectedElement.setData(feature);
                }
            })

            MetaTagging.addMetatags(featuresFreshness,
                allFeaturesSource,
                State.state.knownRelations.data, State.state.layoutToUse.data.layers);
            self.features.setData(featuresFreshness);
        }

        source.features.addCallbackAndRun(_ => update());
        updateTrigger?.addCallback(_ => {
            console.debug("Updating because of external call")
            update();
        })
    }

}