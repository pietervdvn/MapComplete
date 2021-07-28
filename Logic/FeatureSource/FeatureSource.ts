import {UIEventSource} from "../UIEventSource";
import {Utils} from "../../Utils";

export default interface FeatureSource {
    features: UIEventSource<{ feature: any, freshness: Date }[]>;
    /**
     * Mainly used for debuging
     */
    name: string;
}

export class FeatureSourceUtils {

    /**
     * Exports given featurePipeline as a geojson FeatureLists (downloads as a json)
     * @param featurePipeline The FeaturePipeline you want to export
     * @param options The options object
     * @param options.metadata True if you want to include the MapComplete metadata, false otherwise
     */
    public static extractGeoJson(featurePipeline: FeatureSource, options: { metadata?: boolean } = {}) {
        let defaults = {
            metadata: false,
        }
        options = Utils.setDefaults(options, defaults);

        // Select all features, ignore the freshness and other data
        let featureList: any[] = featurePipeline.features.data.map((feature) => 
          JSON.parse(JSON.stringify((feature.feature)))); // Make a deep copy!

        if (!options.metadata) {
            for (let i = 0; i < featureList.length; i++) {
                let feature = featureList[i];
                for (let property in feature.properties) {
                    if (property[0] == "_" && property !== "_lat" && property !== "_lon") {
                        delete featureList[i]["properties"][property];
                    }
                }
            }
        }
        return {type: "FeatureCollection", features: featureList}

  
    }


}