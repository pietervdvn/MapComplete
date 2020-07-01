import * as $ from "jquery"
import {UIEventSource} from "../UI/UIEventSource";

export class Geocoding {

    private static readonly host = "https://nominatim.openstreetmap.org/search?";

    static Search(query: string, currentLocation: UIEventSource<{ lat: number, lon: number }>,
                  handleResult: ((places: { display_name: string, lat: number, lon: number, boundingbox : number[] }[]) => void)) {
        $.getJSON(
            Geocoding.host + "format=json&accept-language=nl&q=" + query,
            function (data) {
               handleResult(data);
            });
    }


}
