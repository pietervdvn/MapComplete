import {UIElement} from "./UIElement";
import {UIEventSource} from "../Logic/UIEventSource";
import * as opening_hours from "opening_hours";

export default class OhVisualization extends UIElement {

    constructor(openingHours: UIEventSource<any>) {
        super(openingHours);
    }

    InnerRender(): string {

        const oh = new opening_hours(this._source.data, {});

       let nominatim_example =  [{
            "place_id": 79276782,
            "licence": "Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright",
            "osm_type": "way",
            "osm_id": 4575088,
            "boundingbox": ["52.5519288", "52.5541724", "-1.8278941", "-1.8238916"],
            "lat": "52.553624",
            "lon": "-1.8256057",
            "display_name": "Pilkington Avenue, Sutton Coldfield, Birmingham, West Midlands Combined Authority, England, B72, United Kingdom",
            "place_rank": 26,
            "category": "highway",
            "type": "residential",
            "importance": 0.4,
            "geojson": {
                "type": "LineString",
                "coordinates": [[-1.8278941, 52.55417], [-1.8277256, 52.5541716], [-1.8276423, 52.5541724], [-1.8267652, 52.5539852], [-1.8261462, 52.5538445], [-1.8258137, 52.5537286], [-1.8256057, 52.553624], [-1.8254024, 52.5534973], [-1.8252343, 52.5533435], [-1.8245486, 52.5526243], [-1.8238916, 52.5519288]]
            }
        }]


        return "";
    }

}