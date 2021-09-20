import {FeatureSourceForLayer} from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import {Utils} from "../../Utils";
import FilteredLayer from "../../Models/FilteredLayer";
import {control} from "leaflet";


/**
 * Fetches a geojson file somewhere and passes it along
 */
export default class GeoJsonSource implements FeatureSourceForLayer {

    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]>;
    public readonly name;
    public readonly isOsmCache: boolean
    private onFail: ((errorMsg: any, url: string) => void) = undefined;
    private readonly seenids: Set<string> = new Set<string>()
    public readonly layer: FilteredLayer;


    public constructor(flayer: FilteredLayer,
                       zxy?: [number, number, number]) {

        if (flayer.layerDef.source.geojsonZoomLevel !== undefined && zxy === undefined) {
            throw "Dynamic layers are not supported. Use 'DynamicGeoJsonTileSource instead"
        }

        this.layer = flayer;
        let url = flayer.layerDef.source.geojsonSource.replace("{layer}", flayer.layerDef.id);
        if (zxy !== undefined) {
            url = url
                .replace('{z}', "" + zxy[0])
                .replace('{x}', "" + zxy[1])
                .replace('{y}', "" + zxy[2])
        }

        this.name = "GeoJsonSource of " + url;

        this.isOsmCache = flayer.layerDef.source.isOsmCacheLayer;
        this.features = new UIEventSource<{ feature: any; freshness: Date }[]>([])
        this.LoadJSONFrom(url)
    }


    private LoadJSONFrom(url: string) {
        const eventSource = this.features;
        const self = this;
        Utils.downloadJson(url)
            .then(json => {
                if (json.elements === [] && json.remarks.indexOf("runtime error") > 0) {
                    self.onFail("Runtime error (timeout)", url)
                    return;
                }
                const time = new Date();
                const newFeatures: { feature: any, freshness: Date } [] = []
                let i = 0;
                let skipped = 0;
                for (const feature of json.features) {
                    const props = feature.properties
                    for (const key in props) {
                        if (typeof props[key] !== "string") {
                            props[key] = "" + props[key]
                        }
                    }

                    if (props.id === undefined) {
                        props.id = url + "/" + i;
                        feature.id = url + "/" + i;
                        i++;
                    }
                    if (self.seenids.has(props.id)) {
                        skipped++;
                        continue;
                    }
                    self.seenids.add(props.id)

                    let freshness: Date = time;
                    if (feature.properties["_last_edit:timestamp"] !== undefined) {
                        freshness = new Date(props["_last_edit:timestamp"])
                    }

                    newFeatures.push({feature: feature, freshness: freshness})
                }
                console.debug("Downloaded " + newFeatures.length + " new features and " + skipped + " already seen features from " + url);

                if (newFeatures.length == 0) {
                    return;
                }

                eventSource.setData(eventSource.data.concat(newFeatures))

            }).catch(msg => console.error("Could not load geojon layer", url, "due to", msg))
    }

}
