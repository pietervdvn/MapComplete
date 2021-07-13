import SplitRoadWizard from "./UI/Popup/SplitRoadWizard";
import State from "./State";
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";

const way = {
    "type": "Feature",
    "properties": {
        "id": "way/1234",
        "highway": "residential",
        "cyclestreet": "yes"
    },
    "geometry": {
        "type": "LineString",
        "coordinates": [
            [
                4.488961100578308,
                51.204971024401374
            ],
            [
                4.4896745681762695,
                51.204712226516435
            ],
            [
                4.489814043045044,
                51.20459459063348
            ],
            [
                4.48991060256958,
                51.204439983016115
            ],
            [
                4.490291476249695,
                51.203845074952376
            ]
        ]
    }
}

State.state = new State(AllKnownLayouts.allKnownLayouts.get("fietsstraten"));
// add road to state
State.state.allElements.addOrGetElement(way);
new SplitRoadWizard("way/1234").AttachTo("maindiv")