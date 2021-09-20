import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import {OsmObject} from "../Osm/OsmObject";
import {Utils} from "../../Utils";
import Loc from "../../Models/Loc";
import FilteredLayer from "../../Models/FilteredLayer";


export default class OsmApiFeatureSource implements FeatureSource {
    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]> = new UIEventSource<{ feature: any; freshness: Date }[]>([]);
    public readonly name: string = "OsmApiFeatureSource";
    private readonly loadedTiles: Set<string> = new Set<string>();
    private readonly _state: {
        leafletMap: UIEventSource<any>;
        locationControl: UIEventSource<Loc>, filteredLayers: UIEventSource<FilteredLayer[]>};

    constructor(state: {locationControl: UIEventSource<Loc>, filteredLayers: UIEventSource<FilteredLayer[]>, leafletMap: UIEventSource<any>,
    overpassMaxZoom: UIEventSource<number>}) {
        this._state = state;
        const self = this;
        function update(){
            const minZoom = state.overpassMaxZoom.data;
            const location = state.locationControl.data
            if(minZoom === undefined || location === undefined){
                return;
            }
            if(minZoom < 14){
                throw "MinZoom should be at least 14 or higher, OSM-api won't work otherwise"
            }
            if(location.zoom > minZoom){
                return;
            }
            self.loadArea()
        }
    }


    public load(id: string) {
        if (id.indexOf("-") >= 0) {
            // Newly added point - not yet in OSM
            return;
        }
        console.debug("Downloading", id, "from the OSM-API")
        OsmObject.DownloadObject(id).addCallbackAndRunD(element => {
            try {
                const geojson = element.asGeoJson();
                geojson.id = geojson.properties.id;
                this.features.setData([{feature: geojson, freshness: element.timestamp}])
            } catch (e) {
                console.error(e)
            }
        })
    }

    /**
     * Loads the current inview-area
     */
    public loadArea(z: number = 14): boolean {
        const layers = this._state.filteredLayers.data;

        const disabledLayers = layers.filter(layer => layer.layerDef.source.overpassScript !== undefined || layer.layerDef.source.geojsonSource !== undefined)
        if (disabledLayers.length > 0) {
            return false;
        }
        if (this._state.leafletMap.data === undefined) {
            return false; // Not yet inited
        }
        const bounds = this._state.leafletMap.data.getBounds()
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
                const keptGeoJson: { feature: any, freshness: Date }[] = []
                // Which layer does the object match?
                for (const object of objects) {

                    for (const flayer of layers) {
                        const layer = flayer.layerDef;
                        const tags = object.tags
                        const doesMatch = layer.source.osmTags.matchesProperties(tags);
                        if (doesMatch) {
                            const geoJson = object.asGeoJson();
                            geoJson._matching_layer_id = layer.id
                            keptGeoJson.push({feature: geoJson, freshness: object.timestamp})
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