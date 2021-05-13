import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import {OsmObject} from "../Osm/OsmObject";
import State from "../../State";
import {Utils} from "../../Utils";
import Loc from "../../Models/Loc";


export default class OsmApiFeatureSource implements FeatureSource {
    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]> = new UIEventSource<{ feature: any; freshness: Date }[]>([]);
    public readonly name: string = "OsmApiFeatureSource";
    private readonly loadedTiles: Set<string> = new Set<string>();

    constructor() {
    }


    public load(id: string) {
        if(id.indexOf("-") >= 0){
            // Newly added point - not yet in OSM
            return;
        }
        console.debug("Downloading", id, "from the OSM-API")
        OsmObject.DownloadObject(id, (element, meta) => {
            const geojson = element.asGeoJson();
            geojson.id = geojson.properties.id;
            this.features.setData([{feature: geojson, freshness: meta["_last_edit:timestamp"]}])
        })
    }

    /**
     * Loads the current inview-area
     */
    public loadArea(z: number = 16): boolean {
        const layers = State.state.filteredLayers.data;

        const disabledLayers = layers.filter(layer => layer.layerDef.source.overpassScript !== undefined || layer.layerDef.source.geojsonSource !== undefined)
        if (disabledLayers.length > 0) {
            return false;
        }
        const loc = State.state.locationControl.data;
        if (loc.zoom < 16) {
            return false;
        }
        if (State.state.leafletMap.data === undefined) {
            return false; // Not yet inited
        }
        const bounds = State.state.leafletMap.data.getBounds()
        const tileRange = Utils.TileRangeBetween(z, bounds.getNorth(), bounds.getEast(), bounds.getSouth(), bounds.getWest())
        const self = this;
        Utils.MapRange(tileRange, (x, y) => {
            const key = x + "/" + y;
            if (self.loadedTiles.has(key)) {
                return;
            }

            self.loadedTiles.add(key);

            const bounds = Utils.tile_bounds(z, x, y);
            console.log("Loading OSM data tile", z, x, y, " with bounds", bounds)
            OsmObject.LoadArea(bounds, objects => {
                const keptGeoJson: {feature:any, freshness: Date}[] = []
                // Which layer does the object match?
                for (const object of objects) {

                    for (const flayer of layers) {
                        const layer = flayer.layerDef;
                        const tags = object.tags
                        const doesMatch = layer.source.osmTags.matchesProperties(tags);
                        if (doesMatch) {
                            const geoJson = object.asGeoJson();
                            geoJson._matching_layer_id = layer.id
                            keptGeoJson.push({feature: geoJson, freshness:  object.timestamp})
                            break;
                        }

                    }

                }

                self.features.setData(keptGeoJson)
            });

        });

        return true;

    }

}