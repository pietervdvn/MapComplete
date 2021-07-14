import SplitRoadWizard from "./UI/Popup/SplitRoadWizard";
import State from "./State";
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";

const way = {
    "type": "Feature",
    "properties": {
        "highway": "residential",
        "maxweight": "3.5",
        "maxweight:conditional": "none @ delivery",
        "name": "Silsstraat",
        "_last_edit:contributor": "Jorisbo",
        "_last_edit:contributor:uid": 1983103,
        "_last_edit:changeset": 70963524,
        "_last_edit:timestamp": "2019-06-05T18:20:44Z",
        "_version_number": 9,
        "id": "way/23583625"
    },
    "geometry": {
        "type": "LineString",
        "coordinates": [
            [
                4.4889691,
                51.2049831
            ],
            [
                4.4895496,
                51.2047718
            ],
            [
                4.48966,
                51.2047147
            ],
            [
                4.4897439,
                51.2046548
            ],
            [
                4.4898162,
                51.2045921
            ],
            [
                4.4902997,
                51.2038418
            ]
        ]
    }
}

State.state = new State(AllKnownLayouts.allKnownLayouts.get("fietsstraten"));
// add road to state
State.state.allElements.addOrGetElement(way);
new SplitRoadWizard("way/23583625").AttachTo("maindiv")