import {Basemap} from "../Leaflet/Basemap";
import $ from "jquery"
export class Geocoding {

    private static readonly host = "https://nominatim.openstreetmap.org/search?";

    static Search(query: string,
                  basemap: Basemap,
                  handleResult: ((places: { display_name: string, lat: number, lon: number, boundingbox: number[] }[]) => void),
                  onFail: (() => void)) {
        const b = basemap.map.getBounds();
        console.log(b);
        $.getJSON(
            Geocoding.host + "format=json&limit=1&viewbox=" + 
            `${b.getEast()},${b.getNorth()},${b.getWest()},${b.getSouth()}`+
            "&accept-language=nl&q=" + query,
            function (data) {
                handleResult(data);
            }).fail(() => {
            onFail();
        });
    }


}
