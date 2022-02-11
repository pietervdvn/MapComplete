/**
 * Fetches a geojson file somewhere and passes it along
 */
import {UIEventSource} from "../../UIEventSource";
import FilteredLayer from "../../../Models/FilteredLayer";
import {Utils} from "../../../Utils";
import {FeatureSourceForLayer, Tiled} from "../FeatureSource";
import {Tiles} from "../../../Models/TileRange";
import {BBox} from "../../BBox";
import {GeoOperations} from "../../GeoOperations";


export default class GeoJsonSource implements FeatureSourceForLayer, Tiled {

    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]>;
    public readonly name;
    public readonly isOsmCache: boolean
    public readonly layer: FilteredLayer;
    public readonly tileIndex
    public readonly bbox;
    private readonly seenids: Set<string>;
    private readonly idKey ?: string;

    public constructor(flayer: FilteredLayer,
                       zxy?: [number, number, number] | BBox,
                       options?: {
                           featureIdBlacklist?: Set<string>
                       }) {

        if (flayer.layerDef.source.geojsonZoomLevel !== undefined && zxy === undefined) {
            throw "Dynamic layers are not supported. Use 'DynamicGeoJsonTileSource instead"
        }

        this.layer = flayer;
        this.idKey = flayer.layerDef.source.idKey
        this.seenids = options?.featureIdBlacklist ?? new Set<string>()
        let url = flayer.layerDef.source.geojsonSource.replace("{layer}", flayer.layerDef.id);
        if (zxy !== undefined) {
            let tile_bbox: BBox;
            if (zxy instanceof BBox) {
                tile_bbox = zxy;
            } else {
                const [z, x, y] = zxy;
                tile_bbox = BBox.fromTile(z, x, y);

                this.tileIndex = Tiles.tile_index(z, x, y)
                this.bbox = BBox.fromTile(z, x, y)
                url = url
                    .replace('{z}', "" + z)
                    .replace('{x}', "" + x)
                    .replace('{y}', "" + y)
            }
            let bounds: { minLat: number, maxLat: number, minLon: number, maxLon: number } = tile_bbox
            if (this.layer.layerDef.source.mercatorCrs) {
                bounds = tile_bbox.toMercator()
            }

            url = url
                .replace('{y_min}', "" + bounds.minLat)
                .replace('{y_max}', "" + bounds.maxLat)
                .replace('{x_min}', "" + bounds.minLon)
                .replace('{x_max}', "" + bounds.maxLon)


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
                if (json.features === undefined || json.features === null) {
                    return;
                }

                if (self.layer.layerDef.source.mercatorCrs) {
                    json = GeoOperations.GeoJsonToWGS84(json)
                }

                const time = new Date();
                const newFeatures: { feature: any, freshness: Date } [] = []
                let i = 0;
                let skipped = 0;
                for (const feature of json.features) {
                    const props = feature.properties
                    for (const key in props) {
                        if (typeof props[key] !== "string") {
                            // Make sure all the values are string, it crashes stuff otherwise
                            props[key] = JSON.stringify(props[key])
                        }
                    }

                    if(self.idKey !== undefined){
                        props.id = props[self.idKey]
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

            }).catch(msg => console.debug("Could not load geojson layer", url, "due to", msg))
    }

}
