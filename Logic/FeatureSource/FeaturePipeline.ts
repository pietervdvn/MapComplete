import FilteringFeatureSource from "../FeatureSource/FilteringFeatureSource";
import State from "../../State";
import FeatureSourceMerger from "../FeatureSource/FeatureSourceMerger";
import RememberingSource from "../FeatureSource/RememberingSource";
import WayHandlingApplyingFeatureSource from "../FeatureSource/WayHandlingApplyingFeatureSource";
import NoOverlapSource from "../FeatureSource/NoOverlapSource";
import FeatureDuplicatorPerLayer from "../FeatureSource/FeatureDuplicatorPerLayer";
import FeatureSource from "../FeatureSource/FeatureSource";
import {UIEventSource} from "../UIEventSource";
import LocalStorageSaver from "./LocalStorageSaver";
import LayerConfig from "../../Customizations/JSON/LayerConfig";
import LocalStorageSource from "./LocalStorageSource";

export default class FeaturePipeline implements FeatureSource {

    public features: UIEventSource<{ feature: any; freshness: Date }[]>;

    constructor(flayers: { isDisplayed: UIEventSource<boolean>, layerDef: LayerConfig }[], updater: FeatureSource) {

        const overpassSource = new WayHandlingApplyingFeatureSource(flayers,
            new NoOverlapSource(flayers, new FeatureDuplicatorPerLayer(flayers, updater))
        );

        const amendedOverpassSource =
            new RememberingSource(new LocalStorageSaver(
                overpassSource
            ));

        const merged = new FeatureSourceMerger([
            amendedOverpassSource,
            new FeatureDuplicatorPerLayer(flayers, State.state.changes),
            new LocalStorageSource()
        ]);
        merged.features.addCallbackAndRun(feats => console.log("Merged has",feats?.length))

        const source =
            new FilteringFeatureSource(
                flayers,
                State.state.locationControl,
                merged
            );
        source.features.addCallbackAndRun(feats => console.log("Filtered has",feats?.length))


        this.features = source.features;
    }

}