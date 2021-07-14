import SplitAction from "./Logic/Osm/SplitAction";
import {GeoOperations} from "./Logic/GeoOperations";

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

let splitPoint = {
    "type": "Feature",
    "properties": {},
    "geometry": {
        "type": "Point",
        "coordinates": [
            4.490211009979248,
            51.2041509326002
        ]
    }
}


let splitClose = {
    "type": "Feature",
    "properties": {},
    "geometry": {
        "type": "Point",
        "coordinates": [
            4.489563927054405,
            51.2047546593862
        ]
    }
}
// State.state = new State(AllKnownLayouts.allKnownLayouts.get("fietsstraten"));
// add road to state
// State.state.allElements.addOrGetElement(way);
new SplitAction(way).DoSplit([splitPoint, splitClose].map(p => GeoOperations.nearestPoint(way,<[number, number]> p.geometry.coordinates)))