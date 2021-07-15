import FeaturePipeline from "./FeaturePipeline";
import {Utils} from "../../Utils";

/**
 * Exports given featurePipeline as a geojson FeatureLists (downloads as a json)
 * @param featurePipeline The FeaturePipeline you want to export
 * @param options The options object
 * @param options.metadata True if you want to include the MapComplete metadata, false otherwise
 */
export function exportAsGeoJson(featurePipeline: FeaturePipeline, options: { metadata?: boolean} = {}) {
    let defaults = {
        metadata: false,
    }
    options = Utils.setDefaults(options, defaults);

    // Select all features, ignore the freshness and other data
    let featureList: JSON[] = featurePipeline ? featurePipeline.features.data.map((feature) => feature.feature) : ["I'm empty"];

    /**
     * Removes the metadata of MapComplete (all properties starting with an underscore)
     * @param featureList JsonList containing features, output object
     */
    function removeMetaData(featureList: JSON[]) {
        for (let i=0; i < featureList.length; i++) {
            let feature = featureList[i];
            for (let property in feature.properties) {
                if (property[0] == "_") {
                    delete featureList[i]["properties"][property];
                }
            }
        }
    }

    if (!options.metadata) removeMetaData(featureList);

    let geojson = {type: "FeatureCollection", features: featureList}

    Utils.offerContentsAsDownloadableFile(JSON.stringify(geojson), "Geodata.json");
}
