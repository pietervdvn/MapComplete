import FilteringFeatureSource from "../FeatureSource/FilteringFeatureSource";
import FeatureSourceMerger from "../FeatureSource/FeatureSourceMerger";
import RememberingSource from "../FeatureSource/RememberingSource";
import WayHandlingApplyingFeatureSource from "../FeatureSource/WayHandlingApplyingFeatureSource";
import FeatureDuplicatorPerLayer from "../FeatureSource/FeatureDuplicatorPerLayer";
import FeatureSource from "../FeatureSource/FeatureSource";
import {UIEventSource} from "../UIEventSource";
import LocalStorageSaver from "./LocalStorageSaver";
import LayerConfig from "../../Customizations/JSON/LayerConfig";
import LocalStorageSource from "./LocalStorageSource";
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";
import Loc from "../../Models/Loc";
import GeoJsonSource from "./GeoJsonSource";
import MetaTaggingFeatureSource from "./MetaTaggingFeatureSource";
import RegisteringFeatureSource from "./RegisteringFeatureSource";

export default class FeaturePipeline implements FeatureSource {

    public features: UIEventSource<{ feature: any; freshness: Date }[]>;

    constructor(flayers: UIEventSource<{ isDisplayed: UIEventSource<boolean>, layerDef: LayerConfig }[]>,
                updater: FeatureSource,
                layout: UIEventSource<LayoutConfig>,
                newPoints: FeatureSource,
                locationControl: UIEventSource<Loc>) {

        const amendedOverpassSource =
            new RememberingSource(
                new LocalStorageSaver(
                    new MetaTaggingFeatureSource( // first we metatag, then we save to get the metatags into storage too
                        new RegisteringFeatureSource(
                            new FeatureDuplicatorPerLayer(flayers,
                                updater)
                        )), layout));

        const geojsonSources: GeoJsonSource [] = []
        for (const flayer of flayers.data) {
            const sourceUrl = flayer.layerDef.source.geojsonSource
            if (sourceUrl !== undefined) {
                geojsonSources.push(new RegisteringFeatureSource(new FeatureDuplicatorPerLayer(flayers,
                    new GeoJsonSource(flayer.layerDef.id, sourceUrl))))
            }
        }

        const amendedLocalStorageSource =
            new RememberingSource(new RegisteringFeatureSource(new FeatureDuplicatorPerLayer(flayers, new LocalStorageSource(layout))
            ));

        newPoints = new MetaTaggingFeatureSource(new FeatureDuplicatorPerLayer(flayers,
            new RegisteringFeatureSource(newPoints)));

        const merged =

            new FeatureSourceMerger([
                amendedOverpassSource,
                amendedLocalStorageSource,
                newPoints,
                ...geojsonSources
            ]);

        const source =
            new WayHandlingApplyingFeatureSource(flayers,
                new FilteringFeatureSource(
                    flayers,
                    locationControl,
                    merged
                ));
        this.features = source.features;
    }

}