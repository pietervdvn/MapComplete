import T from "./TestHelper";
import {Utils} from "../Utils";
import ReplaceGeometryAction from "../Logic/Osm/Actions/ReplaceGeometryAction";
import FeaturePipeline from "../Logic/FeatureSource/FeaturePipeline";
import {Tag} from "../Logic/Tags/Tag";
import MapState from "../Logic/State/MapState";
import * as grb from "../assets/themes/grb_import/grb.json"
import LayoutConfig from "../Models/ThemeConfig/LayoutConfig";
import * as Assert from "assert";

export default class ReplaceGeometrySpec extends T {
    constructor() {
        super("ReplaceGeometry", [
            ["Simple house replacement", async () => {
                const coordinates = <[number, number][]>[
                    [
                        3.216690793633461,
                        51.21474084112525
                    ],
                    [
                        3.2167256623506546,
                        51.214696737309964
                    ],
                    [
                        3.2169999182224274,
                        51.214768983537674
                    ],
                    [
                        3.2169650495052338,
                        51.21480720678671
                    ],
                    [
                        3.2169368863105774,
                        51.21480090625335
                    ],
                    [
                        3.2169489562511444,
                        51.21478074454077
                    ],
                    [
                        3.216886594891548,
                        51.214765203214625
                    ],
                    [
                        3.2168812304735184,
                        51.21477192378873
                    ],
                    [
                        3.2168644666671753,
                        51.214768983537674
                    ],
                    [
                        3.2168537378311157,
                        51.21478746511261
                    ],
                    [
                        3.216690793633461,
                        51.21474084112525
                    ]
                ]

                const targetFeature = {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "Polygon",
                        coordinates: [coordinates]
                    }
                }

                Utils.injectJsonDownloadForTests(
                    "https://www.openstreetmap.org/api/0.6/way/160909312/full",
                    {
                        "version": "0.6",
                        "generator": "CGImap 0.8.5 (920083 spike-06.openstreetmap.org)",
                        "copyright": "OpenStreetMap and contributors",
                        "attribution": "http://www.openstreetmap.org/copyright",
                        "license": "http://opendatacommons.org/licenses/odbl/1-0/",
                        "elements": [{
                            "type": "node",
                            "id": 1728823481,
                            "lat": 51.2146969,
                            "lon": 3.2167247,
                            "timestamp": "2017-07-18T22:52:45Z",
                            "version": 2,
                            "changeset": 50391526,
                            "user": "catweazle67",
                            "uid": 1976209
                        }, {
                            "type": "node",
                            "id": 1728823483,
                            "lat": 51.2147409,
                            "lon": 3.216693,
                            "timestamp": "2017-07-18T22:52:45Z",
                            "version": 2,
                            "changeset": 50391526,
                            "user": "catweazle67",
                            "uid": 1976209
                        }, {
                            "type": "node",
                            "id": 1728823514,
                            "lat": 51.2147863,
                            "lon": 3.2168551,
                            "timestamp": "2017-07-18T22:52:45Z",
                            "version": 2,
                            "changeset": 50391526,
                            "user": "catweazle67",
                            "uid": 1976209
                        }, {
                            "type": "node",
                            "id": 1728823549,
                            "lat": 51.2147399,
                            "lon": 3.2168871,
                            "timestamp": "2017-07-18T22:52:46Z",
                            "version": 2,
                            "changeset": 50391526,
                            "user": "catweazle67",
                            "uid": 1976209
                        }, {
                            "type": "node",
                            "id": 4978288381,
                            "lat": 51.2147638,
                            "lon": 3.2168856,
                            "timestamp": "2017-07-18T22:52:21Z",
                            "version": 1,
                            "changeset": 50391526,
                            "user": "catweazle67",
                            "uid": 1976209
                        }, {
                            "type": "node",
                            "id": 4978289383,
                            "lat": 51.2147676,
                            "lon": 3.2169973,
                            "timestamp": "2017-07-18T22:52:21Z",
                            "version": 1,
                            "changeset": 50391526,
                            "user": "catweazle67",
                            "uid": 1976209
                        }, {
                            "type": "node",
                            "id": 4978289384,
                            "lat": 51.2147683,
                            "lon": 3.2168674,
                            "timestamp": "2017-07-18T22:52:21Z",
                            "version": 1,
                            "changeset": 50391526,
                            "user": "catweazle67",
                            "uid": 1976209
                        }, {
                            "type": "node",
                            "id": 4978289386,
                            "lat": 51.2147718,
                            "lon": 3.2168815,
                            "timestamp": "2017-07-18T22:52:21Z",
                            "version": 1,
                            "changeset": 50391526,
                            "user": "catweazle67",
                            "uid": 1976209
                        }, {
                            "type": "node",
                            "id": 4978289388,
                            "lat": 51.2147884,
                            "lon": 3.2169829,
                            "timestamp": "2017-07-18T22:52:21Z",
                            "version": 1,
                            "changeset": 50391526,
                            "user": "catweazle67",
                            "uid": 1976209
                        }, {
                            "type": "way",
                            "id": 160909312,
                            "timestamp": "2017-07-18T22:52:30Z",
                            "version": 2,
                            "changeset": 50391526,
                            "user": "catweazle67",
                            "uid": 1976209,
                            "nodes": [1728823483, 1728823514, 4978289384, 4978289386, 4978288381, 4978289388, 4978289383, 1728823549, 1728823481, 1728823483],
                            "tags": {
                                "addr:city": "Brugge",
                                "addr:country": "BE",
                                "addr:housenumber": "108",
                                "addr:postcode": "8000",
                                "addr:street": "Ezelstraat",
                                "building": "yes"
                            }
                        }]
                    }
                )

                const wayId = "way/160909312"

                const state = new MapState(
                    new LayoutConfig(<any>grb, true, "ReplaceGeometrySpec.grbtheme")
                )
                const featurePipeline = new FeaturePipeline(
                    _ => {
                    },
                    state
                )

                const action = new ReplaceGeometryAction({
                        osmConnection: undefined,
                        featurePipeline
                    }, targetFeature, wayId, {
                        theme: "test"
                    }
                )
                const info = await action.GetClosestIds()
                console.log(info)
                Assert.equal(coordinates.length, 11)
            }],
            ["Advanced merge case with connections and tags", async () => {


                const osmWay = "way/323230330";
                const grb_data = {
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

                const config = new LayoutConfig(<any>grb, true, "ReplaceGeometrySpec.grbtheme")
                const state = new MapState(
                    config, {
                        attemptLogin: false
                    }
                )
                const featurepipeline = new FeaturePipeline(
                    _ => {
                    },
                    state
                )


                const action = new ReplaceGeometryAction({
                        osmConnection: undefined,
                        featurePipeline: featurepipeline
                    }, grb_data,
                    osmWay,
                    {
                        theme: "test",
                        newTags: [new Tag("test", "yes")]
                    })

                const info = await action.GetClosestIds()
                console.log(info)
            }]
        ]);
    }
}