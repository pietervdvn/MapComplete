import MoveWizard from "./UI/Popup/MoveWizard";
import State from "./State";
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";
import MinimapImplementation from "./UI/Base/MinimapImplementation";
import MoveConfig from "./Models/ThemeConfig/MoveConfig";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import Combine from "./UI/Base/Combine";


State.state = new State(AllKnownLayouts.allKnownLayouts.get("bookcases"))
const feature = {
    "type": "Feature",
    "properties": {
        id: "node/14925464"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [
            4.21875,
            50.958426723359935
        ]
    }
}
/*
MinimapImplementation.initialize()
new MoveWizard(
    feature,
    State.state,
    new MoveConfig({
        enableRelocation: false,
        enableImproveAccuracy: true
    }, "test")).AttachTo("maindiv")

*/
