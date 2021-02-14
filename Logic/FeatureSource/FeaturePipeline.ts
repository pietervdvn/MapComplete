import FilteringFeatureSource from "../FeatureSource/FilteringFeatureSource";
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
import Loc from "../../Models/Loc";

export default class FeaturePipeline implements FeatureSource {

    public features: UIEventSource<{ feature: any; freshness: Date }[]>;

    constructor(flayers: { isDisplayed: UIEventSource<boolean>, layerDef: LayerConfig }[],
                updater: FeatureSource,
                layout: UIEventSource<LayoutConfig>,
                newPoints: FeatureSource,
                locationControl: UIEventSource<Loc>) {

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

        newPoints = new FeatureDuplicatorPerLayer(flayers, newPoints);
        
        const merged = new FeatureSourceMerger([
            amendedOverpassSource,
            amendedLocalStorageSource,
            newPoints
        ]);

        const source =
            new FilteringFeatureSource(
                flayers,
                locationControl,
                merged
            );
        this.features = source.features;
    }

}