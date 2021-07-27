import FilteringFeatureSource from "../FeatureSource/FilteringFeatureSource";
import FeatureSourceMerger from "../FeatureSource/FeatureSourceMerger";
import RememberingSource from "../FeatureSource/RememberingSource";
import WayHandlingApplyingFeatureSource from "../FeatureSource/WayHandlingApplyingFeatureSource";
import FeatureDuplicatorPerLayer from "../FeatureSource/FeatureDuplicatorPerLayer";
import FeatureSource from "../FeatureSource/FeatureSource";
import {UIEventSource} from "../UIEventSource";
import LocalStorageSaver from "./LocalStorageSaver";
import LocalStorageSource from "./LocalStorageSource";
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";
import Loc from "../../Models/Loc";
import GeoJsonSource from "./GeoJsonSource";
import MetaTaggingFeatureSource from "./MetaTaggingFeatureSource";
import RegisteringFeatureSource from "./RegisteringFeatureSource";
import FilteredLayer from "../../Models/FilteredLayer";
import {Changes} from "../Osm/Changes";
import ChangeApplicator from "./ChangeApplicator";

export default class FeaturePipeline implements FeatureSource {

    public features: UIEventSource<{ feature: any; freshness: Date }[]>;

    public readonly name = "FeaturePipeline"

    constructor(flayers: UIEventSource<FilteredLayer[]>,
                changes: Changes,
                updater: FeatureSource,
                fromOsmApi: FeatureSource,
                layout: UIEventSource<LayoutConfig>,
                locationControl: UIEventSource<Loc>,
                selectedElement: UIEventSource<any>) {

        const allLoadedFeatures = new UIEventSource<{ feature: any; freshness: Date }[]>([])

        // first we metatag, then we save to get the metatags into storage too
        // Note that we need to register before we do metatagging (as it expects the event sources)

        // AT last, the metaTagging also needs to be run _after_ the duplicatorPerLayer
        const amendedOverpassSource =
            new RememberingSource(
                new LocalStorageSaver(
                    new MetaTaggingFeatureSource(allLoadedFeatures,
                        new FeatureDuplicatorPerLayer(flayers,
                            new RegisteringFeatureSource(
                                new ChangeApplicator(
                                    updater, changes
                                ))
                        )), layout));

        const geojsonSources: FeatureSource [] = GeoJsonSource
            .ConstructMultiSource(flayers.data, locationControl)
            .map(geojsonSource => {
                let source = new RegisteringFeatureSource(
                    new FeatureDuplicatorPerLayer(flayers,
                        new ChangeApplicator(geojsonSource, changes)));
                if (!geojsonSource.isOsmCache) {
                    source = new MetaTaggingFeatureSource(allLoadedFeatures, source, updater.features);
                }
                return source
            });

        const amendedLocalStorageSource =
            new RememberingSource(new RegisteringFeatureSource(new FeatureDuplicatorPerLayer(flayers, new ChangeApplicator(new LocalStorageSource(layout), changes))
            ));

        const amendedOsmApiSource = new RememberingSource(
            new MetaTaggingFeatureSource(allLoadedFeatures,
                new FeatureDuplicatorPerLayer(flayers,
                    new RegisteringFeatureSource(new ChangeApplicator(fromOsmApi, changes,
                        {
                            // We lump in the new points here
                            generateNewGeometries: true
                        }
                    )))));

        const merged =
            new FeatureSourceMerger([
                amendedOverpassSource,
                amendedOsmApiSource,
                amendedLocalStorageSource,
                ...geojsonSources
            ]);

        merged.features.syncWith(allLoadedFeatures)

        this.features = new WayHandlingApplyingFeatureSource(flayers,
            new FilteringFeatureSource(
                flayers,
                locationControl,
                selectedElement,
                merged
            )).features;
    }

}