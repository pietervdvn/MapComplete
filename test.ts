import FeatureInfoBox from "./UI/Popup/FeatureInfoBox";
import {UIEventSource} from "./Logic/UIEventSource";
import AllKnownLayers from "./Customizations/AllKnownLayers";
import State from "./State";
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";

State.state = new State(AllKnownLayouts.allKnownLayouts.get("charging_stations"))
State.state.changes.pendingChanges.setData([])
const geojson = {
    type: "Feature",
    geometry: {
        type: "Point",
        coordinates: [51.0, 4]
    },
    properties:
        {
            id: "node/42",
            amenity: "charging_station",
        }
}
State.state.allElements.addOrGetElement(geojson)
const tags = State.state.allElements.getEventSourceById("node/42")
new FeatureInfoBox(
    tags,
    AllKnownLayers.sharedLayers.get("charging_station")
).AttachTo("maindiv")