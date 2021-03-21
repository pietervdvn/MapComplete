import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import * as $ from "jquery";
import {Layer} from "leaflet";

/**
 * Fetches a geojson file somewhere and passes it along
 */
export default class GeoJsonSource implements FeatureSource {
    features: UIEventSource<{ feature: any; freshness: Date }[]>;

    constructor(layerId: string, url: string, onFail: ((errorMsg: any) => void) = undefined) {
        if (onFail === undefined) {
            onFail = errorMsg => {
                console.warn(`Could not load geojson layer from`, url, "due to", errorMsg)
            }
        }
        this.features = new UIEventSource<{ feature: any; freshness: Date }[]>(undefined)
        const eventSource = this.features;
        $.getJSON(url, function (json, status) {
            if (status !== "success") {
                console.log("Fetching geojson failed failed")
                onFail(status);
                return;
            }

            if (json.elements === [] && json.remarks.indexOf("runtime error") > 0) {
                console.log("Timeout or other runtime error");
                onFail("Runtime error (timeout)")
                return;
            }
            const time = new Date();
            const features: { feature: any, freshness: Date } [] = []
            let i = 0;
            for (const feature of json.features) {
                if (feature.properties.id === undefined) {
                    feature.properties.id = url + "/" + i;
                    feature.id = url + "/" + i;
                    i++;
                }
                feature._matching_layer_id = layerId;
                features.push({feature: feature, freshness: time})
            }
            console.log("Loaded features are", features)
            eventSource.setData(features)

        }).fail(onFail)

    }


}