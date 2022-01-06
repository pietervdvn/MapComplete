import State from "./State";
import AllKnownLayers from "./Customizations/AllKnownLayers";
import AvailableBaseLayersImplementation from "./Logic/Actors/AvailableBaseLayersImplementation";
import AvailableBaseLayers from "./Logic/Actors/AvailableBaseLayers";
import MinimapImplementation from "./UI/Base/MinimapImplementation";
import {Utils} from "./Utils";
import * as grb from "./assets/themes/grb_import/grb.json";
import ReplaceGeometryAction from "./Logic/Osm/Actions/ReplaceGeometryAction";
import Minimap from "./UI/Base/Minimap";
import ShowDataLayer from "./UI/ShowDataLayer/ShowDataLayer";
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";
import {BBox} from "./Logic/BBox";

AvailableBaseLayers.implement(new AvailableBaseLayersImplementation())
MinimapImplementation.initialize()

async function test() {

    const wayId = "way/323230330";
    const targetFeature = {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [
                        4.483118100000016,
                        51.028366499999706
                    ],
                    [
                        4.483135099999986,
                        51.028325800000005
                    ],
                    [
                        4.483137700000021,
                        51.02831960000019
                    ],
                    [
                        4.4831429000000025,
                        51.0283205
                    ],
                    [
                        4.483262199999987,
                        51.02834059999982
                    ],
                    [
                        4.483276700000019,
                        51.028299999999746
                    ],
                    [
                        4.483342100000037,
                        51.02830730000009
                    ],
                    [
                        4.483340700000012,
                        51.028331299999934
                    ],
                    [
                        4.483346499999953,
                        51.02833189999984
                    ],
                    [
                        4.483290600000001,
                        51.028500699999846
                    ],
                    [
                        4.4833335999999635,
                        51.02851150000015
                    ],
                    [
                        4.4833433000000475,
                        51.028513999999944
                    ],
                    [
                        4.483312899999958,
                        51.02857759999998
                    ],
                    [
                        4.483141100000033,
                        51.02851780000015
                    ],
                    [
                        4.483193100000022,
                        51.028409999999894
                    ],
                    [
                        4.483206100000019,
                        51.02838310000014
                    ],
                    [
                        4.483118100000016,
                        51.028366499999706
                    ]
                ]
            ]
        },
        "id": "https://betadata.grbosm.site/grb?bbox=498980.9206456306,6626173.107985358,499133.7947022009,6626325.98204193/30",
        "bbox": {
            "maxLat": 51.02857759999998,
            "maxLon": 4.483346499999953,
            "minLat": 51.028299999999746,
            "minLon": 4.483118100000016
        },
        "_lon": 4.483232299999985,
        "_lat": 51.02843879999986
    }


    const layout = AllKnownLayouts.allKnownLayouts.get("grb")
    const state = new State(layout)
    State.state = state;
    const bbox = new BBox(
        [[
            4.482952281832695,
            51.02828527958197
        ],
            [
                4.483400881290436,
                51.028578384406984
            ]
           
        ])
    const url = `https://www.openstreetmap.org/api/0.6/map.json?bbox=${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}`
    const data = await Utils.downloadJson(url)

    state.featurePipeline.fullNodeDatabase.handleOsmJson(data, 0)


    const action = new ReplaceGeometryAction(state, targetFeature, wayId, {
            theme: "test"
        }
    )
    
    console.log(">>>>> ", action.GetClosestIds())

    const map = Minimap.createMiniMap({
        attribution: false,
    })
    const preview = await action.getPreview()
    new ShowDataLayer({
        layerToShow: AllKnownLayers.sharedLayers.get("conflation"),
        features: preview,
        leafletMap: map.leafletMap,
        zoomToFeatures: true
    })
    map
        .SetStyle("height: 75vh;")
        .AttachTo("maindiv")
}

test()