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
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";

export default class FeaturePipeline implements FeatureSource {

    public features: UIEventSource<{ feature: any; freshness: Date }[]>;

    constructor(flayers: { isDisplayed: UIEventSource<boolean>, layerDef: LayerConfig }[],
                updater: FeatureSource,
                layout: UIEventSource<LayoutConfig>) {

        const amendedOverpassSource =
            new RememberingSource(
                new WayHandlingApplyingFeatureSource(flayers,
                    new NoOverlapSource(flayers, new FeatureDuplicatorPerLayer(flayers,
                        new LocalStorageSaver(updater, layout)))
                )
            );

        const amendedLocalStorageSource =
            new RememberingSource(
                new WayHandlingApplyingFeatureSource(flayers,
                    new NoOverlapSource(flayers, new FeatureDuplicatorPerLayer(flayers, new LocalStorageSource(layout)))
                ));

        const merged = new FeatureSourceMerger([
            amendedOverpassSource,
            new FeatureDuplicatorPerLayer(flayers, State.state.changes),
            amendedLocalStorageSource
        ]);
        const source =
            new FilteringFeatureSource(
                flayers,
                State.state.locationControl,
                merged
            );
        this.features = source.features;
    }

}