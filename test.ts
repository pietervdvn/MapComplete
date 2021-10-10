import MoveWizard from "./UI/Popup/MoveWizard";
import State from "./State";
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";
import MinimapImplementation from "./UI/Base/MinimapImplementation";


State.state = new State(AllKnownLayouts.allKnownLayouts.get("bookcases"))
const feature = {
    "type": "Feature",
    "properties": {},
    "geometry": {
        "type": "Point",
        "coordinates": [
            4.21875,
            50.958426723359935
        ]
    }
}
MinimapImplementation.initialize()
new MoveWizard(
    feature,
    State.state).AttachTo("maindiv")