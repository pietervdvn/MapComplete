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

    public readonly name = "FeaturePipeline"

    constructor(flayers: UIEventSource<{ isDisplayed: UIEventSource<boolean>, layerDef: LayerConfig }[]>,
                updater: FeatureSource,
                fromOsmApi: FeatureSource,
                layout: UIEventSource<LayoutConfig>,
                newPoints: FeatureSource,
                locationControl: UIEventSource<Loc>,
                selectedElement: UIEventSource<any>) {

        // first we metatag, then we save to get the metatags into storage too
        // Note that we need to register before we do metatagging (as it expects the event sources)

        // AT last, the metaTagging also needs to be run _after_ the duplicatorPerLayer
        const amendedOverpassSource =
            new RememberingSource(
                new LocalStorageSaver(
                    new MetaTaggingFeatureSource(this,
                        new FeatureDuplicatorPerLayer(flayers,
                            new RegisteringFeatureSource(
                                updater)
                        )), layout));

        const geojsonSources: FeatureSource [] = GeoJsonSource
            .ConstructMultiSource(flayers.data, locationControl)
            .map(geojsonSource => {
                let source = new RegisteringFeatureSource(new FeatureDuplicatorPerLayer(flayers, geojsonSource));
                if(!geojsonSource.isOsmCache){
                    source = new MetaTaggingFeatureSource(this, source, updater.features);
                }
                return source
            });

        const amendedLocalStorageSource =
            new RememberingSource(new RegisteringFeatureSource(new FeatureDuplicatorPerLayer(flayers, new LocalStorageSource(layout))
            ));

        newPoints = new MetaTaggingFeatureSource(this,
            new FeatureDuplicatorPerLayer(flayers,
                new RegisteringFeatureSource(newPoints)));

        const amendedOsmApiSource = new RememberingSource(
            new MetaTaggingFeatureSource(this,
                new FeatureDuplicatorPerLayer(flayers,

                    new RegisteringFeatureSource(fromOsmApi))));

        const merged =

            new FeatureSourceMerger([
                amendedOverpassSource,
                amendedOsmApiSource,
                amendedLocalStorageSource,
                newPoints,
                ...geojsonSources
            ]);

        const source =
            new WayHandlingApplyingFeatureSource(flayers,
                new FilteringFeatureSource(
                    flayers,
                    locationControl,
                    selectedElement,
                    merged
                ));
        this.features = source.features;
    }

}