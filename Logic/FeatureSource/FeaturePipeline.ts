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
import GeoJsonSource from "./GeoJsonSource";

export default class FeaturePipeline implements FeatureSource {

    public features: UIEventSource<{ feature: any; freshness: Date }[]>;

    constructor(flayers: UIEventSource<{ isDisplayed: UIEventSource<boolean>, layerDef: LayerConfig }[]>,
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

        const geojsonSources: GeoJsonSource [] = []
        for (const flayer of flayers.data) {
            const sourceUrl = flayer.layerDef.source.geojsonSource
            if (sourceUrl !== undefined) {
                geojsonSources.push(new WayHandlingApplyingFeatureSource(flayers, 
                    new GeoJsonSource(flayer.layerDef.id, sourceUrl)))
            }
        }

        const amendedLocalStorageSource =
            new RememberingSource(
                new WayHandlingApplyingFeatureSource(flayers,
                    new NoOverlapSource(flayers, new FeatureDuplicatorPerLayer(flayers, new LocalStorageSource(layout)))
                ));

        newPoints = new FeatureDuplicatorPerLayer(flayers, newPoints);

        const merged = new FeatureSourceMerger([
            amendedOverpassSource,
            amendedLocalStorageSource,
            newPoints,
            ...geojsonSources
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