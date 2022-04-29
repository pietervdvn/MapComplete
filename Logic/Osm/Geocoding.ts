import State from "../../State";
import {Utils} from "../../Utils";
import {BBox} from "../BBox";

export interface GeoCodeResult {
    display_name: string,
    lat: number, lon: number, boundingbox: number[],
    osm_type: string, osm_id: string
}

export class Geocoding {

    private static readonly host = "https://nominatim.openstreetmap.org/search?";

    static async Search(query: string): Promise<GeoCodeResult[]> {
        const b = State?.state?.currentBounds?.data ?? BBox.global;
        const url = Geocoding.host + "format=json&limit=1&viewbox=" +
            `${b.getEast()},${b.getNorth()},${b.getWest()},${b.getSouth()}` +
            "&accept-language=nl&q=" + query;
       return Utils.downloadJson(url)
    }
}
