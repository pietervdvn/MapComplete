import T from "./TestHelper";
import {Utils} from "../Utils";
import ReplaceGeometryAction from "../Logic/Osm/Actions/ReplaceGeometryAction";
import FeaturePipeline from "../Logic/FeatureSource/FeaturePipeline";
import {Tag} from "../Logic/Tags/Tag";
import MapState from "../Logic/State/MapState";
import * as grb from "../assets/themes/grb_import/grb.json"
import LayoutConfig from "../Models/ThemeConfig/LayoutConfig";
import {AllKnownLayouts} from "../Customizations/AllKnownLayouts";
import State from "../State";
import {BBox} from "../Logic/BBox";
import Minimap from "../UI/Base/Minimap";
import * as Assert from "assert";

export default class ReplaceGeometrySpec extends T {
    constructor() {
        super("ReplaceGeometry", [
            ["Simple house replacement", async () => {

                Minimap.createMiniMap = () => undefined;

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

                const wayId = "way/160909312"

                Utils.injectJsonDownloadForTests(
                    "https://www.openstreetmap.org/api/0.6/map.json?bbox=3.2166673243045807,51.21467321525788,3.217007964849472,51.21482442824023" ,
                    {"version":"0.6","generator":"CGImap 0.8.6 (1549677 spike-06.openstreetmap.org)","copyright":"OpenStreetMap and contributors","attribution":"http://www.openstreetmap.org/copyright","license":"http://opendatacommons.org/licenses/odbl/1-0/","bounds":{"minlat":51.2146732,"minlon":3.2166673,"maxlat":51.2148244,"maxlon":3.217008},"elements":[{"type":"node","id":1612385157,"lat":51.2148016,"lon":3.2168453,"timestamp":"2018-04-30T12:26:00Z","version":3,"changeset":58553478,"user":"Pieter Vander Vennet","uid":3818858},{"type":"node","id":1728816256,"lat":51.2147111,"lon":3.2170233,"timestamp":"2017-07-18T22:52:44Z","version":2,"changeset":50391526,"user":"catweazle67","uid":1976209},{"type":"node","id":1728816287,"lat":51.2146408,"lon":3.2167601,"timestamp":"2021-10-29T16:24:43Z","version":3,"changeset":113131915,"user":"Pieter Vander Vennet","uid":3818858},{"type":"node","id":1728823481,"lat":51.2146968,"lon":3.2167242,"timestamp":"2021-11-02T23:37:11Z","version":5,"changeset":113305401,"user":"Pieter Vander Vennet","uid":3818858},{"type":"node","id":1728823499,"lat":51.2147127,"lon":3.2170302,"timestamp":"2017-07-18T22:52:45Z","version":2,"changeset":50391526,"user":"catweazle67","uid":1976209},{"type":"node","id":1728823501,"lat":51.2148696,"lon":3.2168941,"timestamp":"2017-07-18T22:52:45Z","version":2,"changeset":50391526,"user":"catweazle67","uid":1976209},{"type":"node","id":1728823514,"lat":51.2147863,"lon":3.2168551,"timestamp":"2021-11-02T23:37:11Z","version":5,"changeset":113305401,"user":"Pieter Vander Vennet","uid":3818858},{"type":"node","id":1728823522,"lat":51.2148489,"lon":3.2169012,"timestamp":"2017-07-18T22:52:45Z","version":2,"changeset":50391526,"user":"catweazle67","uid":1976209},{"type":"node","id":1728823523,"lat":51.2147578,"lon":3.2169995,"timestamp":"2017-07-18T22:52:45Z","version":2,"changeset":50391526,"user":"catweazle67","uid":1976209},{"type":"node","id":1728823543,"lat":51.2148075,"lon":3.2166445,"timestamp":"2017-07-18T22:52:46Z","version":3,"changeset":50391526,"user":"catweazle67","uid":1976209},{"type":"node","id":1728823544,"lat":51.2148553,"lon":3.2169315,"timestamp":"2017-07-18T22:52:46Z","version":2,"changeset":50391526,"user":"catweazle67","uid":1976209},{"type":"node","id":1728823549,"lat":51.2147401,"lon":3.2168877,"timestamp":"2021-11-02T23:37:11Z","version":5,"changeset":113305401,"user":"Pieter Vander Vennet","uid":3818858},{"type":"node","id":4978288376,"lat":51.2147306,"lon":3.2168928,"timestamp":"2017-07-18T22:52:21Z","version":1,"changeset":50391526,"user":"catweazle67","uid":1976209},{"type":"node","id":4978288381,"lat":51.2147638,"lon":3.2168856,"timestamp":"2021-11-02T23:37:11Z","version":4,"changeset":113305401,"user":"Pieter Vander Vennet","uid":3818858},{"type":"node","id":4978288382,"lat":51.2148189,"lon":3.216912,"timestamp":"2017-07-18T22:52:21Z","version":1,"changeset":50391526,"user":"catweazle67","uid":1976209},{"type":"node","id":4978288385,"lat":51.2148835,"lon":3.2170623,"timestamp":"2017-07-18T22:52:21Z","version":1,"changeset":50391526,"user":"catweazle67","uid":1976209},{"type":"node","id":4978288387,"lat":51.2148904,"lon":3.2171037,"timestamp":"2017-07-18T22:52:21Z","version":1,"changeset":50391526,"user":"catweazle67","uid":1976209},{"type":"node","id":4978289383,"lat":51.2147678,"lon":3.2169969,"timestamp":"2021-11-02T23:37:11Z","version":4,"changeset":113305401,"user":"Pieter Vander Vennet","uid":3818858},{"type":"node","id":4978289384,"lat":51.2147684,"lon":3.2168674,"timestamp":"2021-11-02T23:37:11Z","version":4,"changeset":113305401,"user":"Pieter Vander Vennet","uid":3818858},{"type":"node","id":4978289386,"lat":51.2147716,"lon":3.2168811,"timestamp":"2021-11-02T23:37:11Z","version":4,"changeset":113305401,"user":"Pieter Vander Vennet","uid":3818858},{"type":"node","id":4978289388,"lat":51.2148115,"lon":3.216966,"timestamp":"2021-11-02T23:38:13Z","version":7,"changeset":113306325,"user":"Pieter Vander Vennet","uid":3818858},{"type":"node","id":4978289391,"lat":51.2148019,"lon":3.2169194,"timestamp":"2017-07-18T22:52:21Z","version":1,"changeset":50391526,"user":"catweazle67","uid":1976209},{"type":"node","id":9219974337,"lat":51.2148449,"lon":3.2171278,"timestamp":"2021-11-02T23:40:52Z","version":1,"changeset":113305401,"user":"Pieter Vander Vennet","uid":3818858},{"type":"node","id":9219979643,"lat":51.2147405,"lon":3.216693,"timestamp":"2021-11-02T23:37:11Z","version":1,"changeset":113305401,"user":"Pieter Vander Vennet","uid":3818858},{"type":"node","id":9219979646,"lat":51.2148043,"lon":3.2169312,"timestamp":"2021-11-02T23:38:13Z","version":2,"changeset":113306325,"user":"Pieter Vander Vennet","uid":3818858},{"type":"node","id":9219979647,"lat":51.2147792,"lon":3.2169466,"timestamp":"2021-11-02T23:37:11Z","version":1,"changeset":113305401,"user":"Pieter Vander Vennet","uid":3818858},{"type":"way","id":160909311,"timestamp":"2021-12-23T12:03:37Z","version":6,"changeset":115295690,"user":"s8evq","uid":3710738,"nodes":[1728823481,1728823549,4978288376,1728823523,1728823499,1728816256,1728816287,1728823481],"tags":{"addr:city":"Brugge","addr:country":"BE","addr:housenumber":"106","addr:postcode":"8000","addr:street":"Ezelstraat","building":"house","source:geometry:date":"2015-07-09","source:geometry:ref":"Gbg/2391617"}},{"type":"way","id":160909312,"timestamp":"2021-11-02T23:38:13Z","version":4,"changeset":113306325,"user":"Pieter Vander Vennet","uid":3818858,"nodes":[9219979643,1728823481,1728823549,4978289383,4978289388,9219979646,9219979647,4978288381,4978289386,4978289384,1728823514,9219979643],"tags":{"addr:city":"Brugge","addr:country":"BE","addr:housenumber":"108","addr:postcode":"8000","addr:street":"Ezelstraat","building":"house","source:geometry:date":"2018-10-02","source:geometry:ref":"Gbg/5926383"}},{"type":"way","id":160909315,"timestamp":"2021-12-23T12:03:37Z","version":8,"changeset":115295690,"user":"s8evq","uid":3710738,"nodes":[1728823543,1728823501,1728823522,4978288382,1612385157,1728823514,9219979643,1728823543],"tags":{"addr:city":"Brugge","addr:country":"BE","addr:housenumber":"110","addr:postcode":"8000","addr:street":"Ezelstraat","building":"house","name":"La Style","shop":"hairdresser","source:geometry:date":"2015-07-09","source:geometry:ref":"Gbg/5260837"}},{"type":"way","id":508533816,"timestamp":"2021-12-23T12:03:37Z","version":7,"changeset":115295690,"user":"s8evq","uid":3710738,"nodes":[4978288387,4978288385,1728823544,1728823522,4978288382,4978289391,9219979646,4978289388,9219974337,4978288387],"tags":{"building":"yes","source:geometry:date":"2015-07-09","source:geometry:ref":"Gbg/5260790"}}]}
                )

                Utils.injectJsonDownloadForTests(
                    "https://www.openstreetmap.org/api/0.6/way/160909312/full" ,
                    {"version":"0.6","generator":"CGImap 0.8.6 (2407324 spike-06.openstreetmap.org)","copyright":"OpenStreetMap and contributors","attribution":"http://www.openstreetmap.org/copyright","license":"http://opendatacommons.org/licenses/odbl/1-0/","elements":[{"type":"node","id":1728823481,"lat":51.2146968,"lon":3.2167242,"timestamp":"2021-11-02T23:37:11Z","version":5,"changeset":113305401,"user":"Pieter Vander Vennet","uid":3818858},{"type":"node","id":1728823514,"lat":51.2147863,"lon":3.2168551,"timestamp":"2021-11-02T23:37:11Z","version":5,"changeset":113305401,"user":"Pieter Vander Vennet","uid":3818858},{"type":"node","id":1728823549,"lat":51.2147401,"lon":3.2168877,"timestamp":"2021-11-02T23:37:11Z","version":5,"changeset":113305401,"user":"Pieter Vander Vennet","uid":3818858},{"type":"node","id":4978288381,"lat":51.2147638,"lon":3.2168856,"timestamp":"2021-11-02T23:37:11Z","version":4,"changeset":113305401,"user":"Pieter Vander Vennet","uid":3818858},{"type":"node","id":4978289383,"lat":51.2147678,"lon":3.2169969,"timestamp":"2021-11-02T23:37:11Z","version":4,"changeset":113305401,"user":"Pieter Vander Vennet","uid":3818858},{"type":"node","id":4978289384,"lat":51.2147684,"lon":3.2168674,"timestamp":"2021-11-02T23:37:11Z","version":4,"changeset":113305401,"user":"Pieter Vander Vennet","uid":3818858},{"type":"node","id":4978289386,"lat":51.2147716,"lon":3.2168811,"timestamp":"2021-11-02T23:37:11Z","version":4,"changeset":113305401,"user":"Pieter Vander Vennet","uid":3818858},{"type":"node","id":4978289388,"lat":51.2148115,"lon":3.216966,"timestamp":"2021-11-02T23:38:13Z","version":7,"changeset":113306325,"user":"Pieter Vander Vennet","uid":3818858},{"type":"node","id":9219979643,"lat":51.2147405,"lon":3.216693,"timestamp":"2021-11-02T23:37:11Z","version":1,"changeset":113305401,"user":"Pieter Vander Vennet","uid":3818858},{"type":"node","id":9219979646,"lat":51.2148043,"lon":3.2169312,"timestamp":"2021-11-02T23:38:13Z","version":2,"changeset":113306325,"user":"Pieter Vander Vennet","uid":3818858},{"type":"node","id":9219979647,"lat":51.2147792,"lon":3.2169466,"timestamp":"2021-11-02T23:37:11Z","version":1,"changeset":113305401,"user":"Pieter Vander Vennet","uid":3818858},{"type":"way","id":160909312,"timestamp":"2021-11-02T23:38:13Z","version":4,"changeset":113306325,"user":"Pieter Vander Vennet","uid":3818858,"nodes":[9219979643,1728823481,1728823549,4978289383,4978289388,9219979646,9219979647,4978288381,4978289386,4978289384,1728823514,9219979643],"tags":{"addr:city":"Brugge","addr:country":"BE","addr:housenumber":"108","addr:postcode":"8000","addr:street":"Ezelstraat","building":"house","source:geometry:date":"2018-10-02","source:geometry:ref":"Gbg/5926383"}}]}
                )
                Utils.injectJsonDownloadForTests("https://raw.githubusercontent.com/pietervdvn/MapComplete-data/main/latlon2country/0.0.0.json","be")

                const layout = AllKnownLayouts.allKnownLayouts.get("grb")
                const state = new State(layout)
                State.state = state;
                const bbox = new BBox(
                    [[
                        3.2166673243045807,
                        51.21467321525788
                    ],
                        [
                            3.217007964849472,
                            51.21482442824023
                        ]
                    ])
                const url = `https://www.openstreetmap.org/api/0.6/map.json?bbox=${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}`
                const data = await Utils.downloadJson(url)

                state.featurePipeline.fullNodeDatabase.handleOsmJson(data, 0)


                const action = new ReplaceGeometryAction(state, targetFeature, wayId, {
                        theme: "test"
                    }
                )

                const closestIds = await action.GetClosestIds()
                T.listIdentical<number>(
                    [9219979643,
                        1728823481,
                        4978289383,
                        4978289388,
                        9219979646,
                        9219979647,
                        4978288381,
                        4978289386,
                        4978289384,
                        1728823514,
                        undefined],
                    closestIds.closestIds
                ) ;
                   
                T.equals( 1 , closestIds.reprojectedNodes.size, "Expected only a single reprojected node");
                const reproj = closestIds.reprojectedNodes.get(1728823549)
                T.equals(1, reproj.projectAfterIndex)
                T.equals( 3.2168880864669203,  reproj.newLon);
                T.equals( 51.214739524104694,  reproj.newLat);
                T.equals(0, closestIds.detachedNodes.size)
               const changes = await action.Perform(state.changes)
              T.listIdentical([[3.216690793633461,51.21474084112525],[3.2167256623506546,51.214696737309964],[3.2168880864669203,51.214739524104694],[3.2169999182224274,51.214768983537674],[3.2169650495052338,51.21480720678671],[3.2169368863105774,51.21480090625335],[3.2169489562511444,51.21478074454077],[3.216886594891548,51.214765203214625],[3.2168812304735184,51.21477192378873],[3.2168644666671753,51.214768983537674],[3.2168537378311157,51.21478746511261],[3.216690793633461,51.21474084112525]],
                  changes[11].changes["coordinates"])
              
            }],
            ["Advanced merge case with connections and tags", async () => {
            return

                Minimap.createMiniMap = () => undefined;

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