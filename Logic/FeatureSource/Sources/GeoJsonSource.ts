/**
 * Fetches a geojson file somewhere and passes it along
 */
import {UIEventSource} from "../../UIEventSource";
import FilteredLayer from "../../../Models/FilteredLayer";
import {Utils} from "../../../Utils";
import {FeatureSourceForLayer, Tiled} from "../FeatureSource";
import {Tiles} from "../../../Models/TileRange";
import {BBox} from "../../BBox";


export default class GeoJsonSource implements FeatureSourceForLayer, Tiled {

    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]>;
    public readonly name;
    public readonly isOsmCache: boolean
    private onFail: ((errorMsg: any, url: string) => void) = undefined;
    private readonly seenids: Set<string> = new Set<string>()
    public readonly layer: FilteredLayer;

    public readonly tileIndex
    public readonly bbox;

    public constructor(flayer: FilteredLayer,
                       zxy?: [number, number, number]) {

        if (flayer.layerDef.source.geojsonZoomLevel !== undefined && zxy === undefined) {
            throw "Dynamic layers are not supported. Use 'DynamicGeoJsonTileSource instead"
        }

        this.layer = flayer;
        let url = flayer.layerDef.source.geojsonSource.replace("{layer}", flayer.layerDef.id);
        if (zxy !== undefined) {
            const [z, x, y] = zxy;
            url = url
                .replace('{z}', "" + z)
                .replace('{x}', "" + x)
                .replace('{y}', "" + y)
            this.tileIndex = Tiles.tile_index(z, x, y)
            this.bbox = BBox.fromTile(z, x, y)
        } else {
            this.tileIndex = Tiles.tile_index(0, 0, 0)
            this.bbox = BBox.global;
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

                if (newFeatures.length == 0) {
                    return;
                }

                eventSource.setData(eventSource.data.concat(newFeatures))

            }).catch(msg => console.error("Could not load geojon layer", url, "due to", msg))
    }

}
