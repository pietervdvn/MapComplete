import {UIEventSource} from "./Logic/UIEventSource";
import LayoutConfig from "./Customizations/JSON/LayoutConfig";
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";
import State from "./State";

const layout = new UIEventSource<LayoutConfig>(AllKnownLayouts.allKnownLayouts.get("bookcases"))
State.state = new State(layout.data)

const features = new UIEventSource<{ feature: any }[]>([
    {
        feature: {
            "type": "Feature",
            "properties": {"amenity": "public_bookcase", "id": "node/123"},

            id: "node/123",
            _matching_layer_id: "public_bookcase",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    3.220506906509399,
                    51.215009243433094
                ]
            }
        }
    }, {
        feature: {
            "type": "Feature",
            "properties": {
                amenity: "public_bookcase",
                id: "node/456"
            },
            _matching_layer_id: "public_bookcase",
            id: "node/456",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    3.4243011474609375,
                    51.138432319543924
                ]
            }
        }
    }
])

features.data.map(f => State.state.allElements.addOrGetElement(f.feature))


