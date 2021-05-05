import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import {OsmObject} from "../Osm/OsmObject";


export default class OsmApiFeatureSource implements FeatureSource {
    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]> = new UIEventSource<{ feature: any; freshness: Date }[]>([]);
    public readonly name: string = "OsmApiFeatureSource";
   
    
    public load(id: string){
        console.log("Updating from OSM API: ", id)
        OsmObject.DownloadObject(id, (element, meta) => {
            const geojson = element.asGeoJson();
            console.warn(geojson)
            geojson.id = geojson.properties.id;
            this.features.setData([{feature:geojson, freshness: meta["_last_edit:timestamp"]}])
        })
    }

}