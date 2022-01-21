import * as Assert from "assert";
import {equal} from "assert";
import T from "./TestHelper";
import {GeoOperations} from "../Logic/GeoOperations";
import {BBox} from "../Logic/BBox";
import * as turf from "@turf/turf"

export default class GeoOperationsSpec extends T {

    private static polygon = {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [
                        1.8017578124999998,
                        50.401515322782366
                    ],
                    [
                        -3.1640625,
                        46.255846818480315
                    ],
                    [
                        5.185546875,
                        44.74673324024678
                    ],
                    [
                        1.8017578124999998,
                        50.401515322782366
                    ]
                ]
            ]
        }
    };
    private static multiPolygon = {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "MultiPolygon",
            "coordinates": [[
                [
                    [
                        1.8017578124999998,
                        50.401515322782366
                    ],
                    [
                        -3.1640625,
                        46.255846818480315
                    ],
                    [
                        5.185546875,
                        44.74673324024678
                    ],
                    [
                        1.8017578124999998,
                        50.401515322782366
                    ]
                ],
                [
                    [
                        1.0107421875,
                        48.821332549646634
                    ],
                    [
                        1.329345703125,
                        48.25394114463431
                    ],
                    [
                        1.988525390625,
                        48.71271258145237
                    ],
                    [
                        0.999755859375,
                        48.86471476180277
                    ],
                    [
                        1.0107421875,
                        48.821332549646634
                    ]
                ]
            ]]
        }
    };

    private static inHole = [1.42822265625, 48.61838518688487]
    private static inMultiPolygon = [2.515869140625, 47.37603463349758]
    private static outsidePolygon = [4.02099609375, 47.81315451752768]

    constructor() {
        super([
                ["Point out of polygon", () => {
                    GeoOperationsSpec.isFalse(GeoOperations.inside([
                        3.779296875,
                        48.777912755501845
                    ], GeoOperationsSpec.polygon), "Point is outside of the polygon");
                }

                ],
                ["Point inside of polygon", () => {

                    GeoOperationsSpec.isTrue(GeoOperations.inside([
                        1.23046875,
                        47.60616304386874
                    ], GeoOperationsSpec.polygon), "Point is inside of the polygon");
                }
                ],
                ["MultiPolygonTest", () => {

                    const isTrue = GeoOperationsSpec.isTrue;
                    const isFalse = GeoOperationsSpec.isFalse;

                    isFalse(GeoOperations.inside(GeoOperationsSpec.inHole, GeoOperationsSpec.multiPolygon), "InHole was detected as true");
                    isTrue(GeoOperations.inside(GeoOperationsSpec.inMultiPolygon, GeoOperationsSpec.multiPolygon), "InMultiPolgyon was not detected as true");
                    isFalse(GeoOperations.inside(GeoOperationsSpec.outsidePolygon, GeoOperationsSpec.multiPolygon), "OutsideOfPolygon was detected as true");

                }],
                ["Intersection between a line and a polygon", () => {
                    const line = {
                        "type": "Feature",
                        "properties": {},
                        "geometry": {
                            "type": "LineString",
                            "coordinates": [
                                [
                                    3.779296875,
                                    48.777912755501845
                                ],
                                [
                                    1.23046875,
                                    47.60616304386874
                                ]
                            ]
                        }
                    };

                    const overlap = GeoOperations.calculateOverlap(line, [GeoOperationsSpec.polygon]);
                    Assert.equal(1, overlap.length)
                }],
                ["Fully enclosed", () => {
                    const line = {
                        "type": "Feature",
                        "properties": {},
                        "geometry": {
                            "type": "LineString",
                            "coordinates": [
                                [
                                    0.0439453125,
                                    47.31648293428332
                                ],
                                [
                                    0.6591796875,
                                    46.77749276376827
                                ]
                            ]
                        }
                    };

                    const overlap = GeoOperations.calculateOverlap(line, [GeoOperationsSpec.polygon]);
                    Assert.equal(1, overlap.length)
                }],
                ["overlapWith matches points too", () => {
                    const point = {
                        "type": "Feature",
                        "properties": {},
                        "geometry": {
                            "type": "Point",
                            "coordinates": [
                                2.274169921875,
                                46.76244305208004
                            ]
                        }
                    };

                    const overlap = GeoOperations.calculateOverlap(point, [GeoOperationsSpec.polygon]);
                    Assert.equal(1, overlap.length)
                }],
                ["bbox bounds test",
                    () => {
                        const bbox = BBox.fromTile(16, 32754, 21785)
                        equal(-0.076904296875, bbox.minLon)
                        equal(-0.0714111328125, bbox.maxLon)
                        equal(51.5292513551899, bbox.minLat)
                        equal(51.53266860674158, bbox.maxLat)
                    }
                ],
                ["Regression test: intersection/overlap", () => {

                    const polyGrb = {
                        "type": "Feature",
                        "properties": {
                            "osm_id": "25189153",
                            "size_grb_building": "217.14",
                            "addr:housenumber": "173",
                            "addr:street": "Kortrijksestraat",
                            "building": "house",
                            "source:geometry:entity": "Gbg",
                            "source:geometry:date": "2015/02/27",
                            "source:geometry:oidn": "1729460",
                            "source:geometry:uidn": "8713648",
                            "H_DTM_MIN": "17.28",
                            "H_DTM_GEM": "17.59",
                            "H_DSM_MAX": "29.04",
                            "H_DSM_P99": "28.63",
                            "HN_MAX": "11.45",
                            "HN_P99": "11.04",
                            "detection_method": "from existing OSM building source: house ,hits (3)",
                            "auto_building": "house",
                            "size_shared": "210.68",
                            "size_source_building": "212.63",
                            "id": "https://betadata.grbosm.site/grb?bbox=360935.6475626023,6592540.815539878,361088.52161917265,6592693.689596449/37",
                            "_lat": "50.83736194999996",
                            "_lon": "3.2432137000000116",
                            "_layer": "GRB",
                            "_length": "48.51529464293261",
                            "_length:km": "0.0",
                            "_now:date": "2021-12-05",
                            "_now:datetime": "2021-12-05 21:51:40",
                            "_loaded:date": "2021-12-05",
                            "_loaded:datetime": "2021-12-05 21:51:40"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        3.2431059999999974,
                                        50.83730270000021
                                    ],
                                    [
                                        3.243174299999987,
                                        50.83728850000007
                                    ],
                                    [
                                        3.2432116000000173,
                                        50.83736910000003
                                    ],
                                    [
                                        3.2433214000000254,
                                        50.83740350000011
                                    ],
                                    [
                                        3.24329779999996,
                                        50.837435399999855
                                    ],
                                    [
                                        3.2431881000000504,
                                        50.83740090000025
                                    ],
                                    [
                                        3.243152699999997,
                                        50.83738980000017
                                    ],
                                    [
                                        3.2431059999999974,
                                        50.83730270000021
                                    ]
                                ]
                            ]
                        },
                        "id": "https://betadata.grbosm.site/grb?bbox=360935.6475626023,6592540.815539878,361088.52161917265,6592693.689596449/37",
                        "_lon": 3.2432137000000116,
                        "_lat": 50.83736194999996,
                        "bbox": {
                            "maxLat": 50.837435399999855,
                            "maxLon": 3.2433214000000254,
                            "minLat": 50.83728850000007,
                            "minLon": 3.2431059999999974
                        }
                    }
                    const polyHouse = {
                        "type": "Feature",
                        "id": "way/594963177",
                        "properties": {
                            "timestamp": "2021-12-05T04:04:55Z",
                            "version": 3,
                            "changeset": 114571409,
                            "user": "Pieter Vander Vennet",
                            "uid": 3818858,
                            "addr:housenumber": "171",
                            "addr:street": "Kortrijksestraat",
                            "building": "house",
                            "source:geometry:date": "2018-10-22",
                            "source:geometry:ref": "Gbg/5096537",
                            "_last_edit:contributor": "Pieter Vander Vennet",
                            "_last_edit:contributor:uid": 3818858,
                            "_last_edit:changeset": 114571409,
                            "_last_edit:timestamp": "2021-12-05T04:04:55Z",
                            "_version_number": 3,
                            "id": "way/594963177",
                            "_backend": "https://www.openstreetmap.org",
                            "_lat": "50.83736395",
                            "_lon": "3.2430937",
                            "_layer": "OSM-buildings",
                            "_length": "43.561938680928506",
                            "_length:km": "0.0",
                            "_now:date": "2021-12-05",
                            "_now:datetime": "2021-12-05 21:51:40",
                            "_loaded:date": "2021-12-05",
                            "_loaded:datetime": "2021-12-05 21:51:39",
                            "_surface": "93.32785810484549",
                            "_surface:ha": "0"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        3.2429993,
                                        50.8373243
                                    ],
                                    [
                                        3.243106,
                                        50.8373027
                                    ],
                                    [
                                        3.2431527,
                                        50.8373898
                                    ],
                                    [
                                        3.2431881,
                                        50.8374009
                                    ],
                                    [
                                        3.2431691,
                                        50.8374252
                                    ],
                                    [
                                        3.2430936,
                                        50.837401
                                    ],
                                    [
                                        3.243046,
                                        50.8374112
                                    ],
                                    [
                                        3.2429993,
                                        50.8373243
                                    ]
                                ]
                            ]
                        },
                        "_lon": 3.2430937,
                        "_lat": 50.83736395,
                        "bbox": {
                            "maxLat": 50.8374252,
                            "maxLon": 3.2431881,
                            "minLat": 50.8373027,
                            "minLon": 3.2429993
                        }
                    }

                    const p0 = turf.polygon(polyGrb.geometry.coordinates)
                    Assert.notEqual(p0, null)
                    const p1 = turf.polygon(polyHouse.geometry.coordinates)
                    Assert.notEqual(p1, null)
                    
                    const overlaps = GeoOperations.calculateOverlap(polyGrb, [polyHouse])
                    Assert.equal(overlaps.length, 0)
                    const overlapsRev = GeoOperations.calculateOverlap(polyHouse, [polyGrb])
                    Assert.equal(overlapsRev.length, 0)

                }],
                ["Overnode removal test", () => {

                   const feature = { "geometry": {
                        "type": "Polygon",
                            "coordinates": [
                            [
                                [
                                    4.477944199999975,
                                    51.02783550000022
                                ],
                                [
                                    4.477987899999996,
                                    51.027818800000034
                                ],
                                [
                                    4.478004500000021,
                                    51.02783399999988
                                ],
                                [
                                    4.478025499999962,
                                    51.02782489999994
                                ],
                                [
                                    4.478079099999993,
                                    51.027873899999896
                                ],
                                [
                                    4.47801040000006,
                                    51.027903799999955
                                ],
                                [
                                    4.477964799999972,
                                    51.02785709999982
                                ],
                                [
                                    4.477964699999964,
                                    51.02785690000006
                                ],
                                [
                                    4.477944199999975,
                                    51.02783550000022
                                ]
                            ]
                        ]
                    }}
                
                    const copy = GeoOperations.removeOvernoding(feature)
                    Assert.equal(copy.geometry.coordinates[0].length, 7)
                    T.listIdentical([
                        [
                            4.477944199999975,
                            51.02783550000022
                        ],
                        [
                            4.477987899999996,
                            51.027818800000034
                        ],
                        [
                            4.478004500000021,
                            51.02783399999988
                        ],
                        [
                            4.478025499999962,
                            51.02782489999994
                        ],
                        [
                            4.478079099999993,
                            51.027873899999896
                        ],
                        [
                            4.47801040000006,
                            51.027903799999955
                        ],
                        [
                            4.477944199999975,
                            51.02783550000022
                        ]
                    ], copy.geometry.coordinates[0])
                }]
            ]
        )

    }
}
