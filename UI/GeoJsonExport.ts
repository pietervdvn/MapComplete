import FeaturePipeline from "../Logic/FeatureSource/FeaturePipeline";
import {Utils} from "../Utils";

export function exportAsGeoJson(featurePipeline: FeaturePipeline, options?: {metadata?: boolean}) {
    let defaults = {
        metadata: false
    }
    options = Utils.setDefaults(options, defaults);
    // Select all features, ignore the freshness and other data
    // TODO: Remove mapcomplete metadata (starting with underscore)
    let featureList: JSON[] = featurePipeline? featurePipeline.features.data.map((feature) => feature.feature) : ["I'm empty"];
    let geojson = {type: "FeatureCollection", features: featureList}

    Utils.offerContentsAsDownloadableFile(JSON.stringify(geojson), "Geodata.json");
}
