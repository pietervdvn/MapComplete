import FeaturePipeline from "../Logic/FeatureSource/FeaturePipeline";
import {Utils} from "../Utils";

export function exportAsGeoJson(featurePipeline: FeaturePipeline, options?: { metadata?: boolean }) {
    let defaults = {
        metadata: false
    }
    options = Utils.setDefaults(options, defaults);
    // Select all features, ignore the freshness and other data
    let featureList: JSON[] = featurePipeline ? featurePipeline.features.data.map((feature) => feature.feature) : ["I'm empty"];

    function removeMetaData(featureList: JSON[]) {
        for (let i=0; i < featureList.length; i++) {
            let feature = featureList[i];
            for (let property in feature.properties) {
                if (property[0] == "_") {
                    delete featureList[i]["properties"][property];
                }
            }
        }
        return featureList;
    }

    // Remove the metadata of MapComplete (all properties starting with an underscore)
    if (!options.metadata) {
        removeMetaData(featureList);
    }

    let geojson = {type: "FeatureCollection", features: featureList}

    Utils.offerContentsAsDownloadableFile(JSON.stringify(geojson), "Geodata.json");
}
