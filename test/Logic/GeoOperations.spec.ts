import * as turf from "@turf/turf"
import { GeoOperations } from "../../src/Logic/GeoOperations"
import { Feature, LineString, Polygon } from "geojson"
import { describe, expect, it } from "vitest"

describe("GeoOperations", () => {
    describe("calculateOverlap", () => {
        it("should not give too much overlap (regression test)", () => {
            const polyGrb: Feature<Polygon> = <any>{
                type: "Feature",
                properties: {
                    osm_id: "25189153",
                    size_grb_building: "217.14",
                    "addr:housenumber": "173",
                    "addr:street": "Kortrijksestraat",
                    building: "house",
                    "source:geometry:entity": "Gbg",
                    "source:geometry:date": "2015/02/27",
                    "source:geometry:oidn": "1729460",
                    "source:geometry:uidn": "8713648",
                    H_DTM_MIN: "17.28",
                    H_DTM_GEM: "17.59",
                    H_DSM_MAX: "29.04",
                    H_DSM_P99: "28.63",
                    HN_MAX: "11.45",
                    HN_P99: "11.04",
                    detection_method: "from existing OSM building source: house ,hits (3)",
                    auto_building: "house",
                    size_shared: "210.68",
                    size_source_building: "212.63",
                    id: "https://betadata.grbosm.site/grb?bbox=360935.6475626023,6592540.815539878,361088.52161917265,6592693.689596449/37",
                    _lat: "50.83736194999996",
                    _lon: "3.2432137000000116",
                    _layer: "GRB",
                    _length: "48.51529464293261",
                    "_length:km": "0.0",
                    "_now:date": "2021-12-05",
                    "_now:datetime": "2021-12-05 21:51:40",
                    "_loaded:date": "2021-12-05",
                    "_loaded:datetime": "2021-12-05 21:51:40"
                },
                geometry: {
                    type: "Polygon",
                    coordinates: [
                        [
                            [3.2431059999999974, 50.83730270000021],
                            [3.243174299999987, 50.83728850000007],
                            [3.2432116000000173, 50.83736910000003],
                            [3.2433214000000254, 50.83740350000011],
                            [3.24329779999996, 50.837435399999855],
                            [3.2431881000000504, 50.83740090000025],
                            [3.243152699999997, 50.83738980000017],
                            [3.2431059999999974, 50.83730270000021]
                        ]
                    ]
                },
                id: "https://betadata.grbosm.site/grb?bbox=360935.6475626023,6592540.815539878,361088.52161917265,6592693.689596449/37",
                _lon: 3.2432137000000116,
                _lat: 50.83736194999996,
                bbox: {
                    minLat: 50.83728850000007,
                    maxLat: 50.837435399999855,
                    maxLon: 3.2433214000000254,
                    minLon: 3.2431059999999974
                }
            }
            const polyHouse: Feature<Polygon> = <any>{
                type: "Feature",
                id: "way/594963177",
                properties: {
                    timestamp: "2021-12-05T04:04:55Z",
                    version: 3,
                    changeset: 114571409,
                    user: "Pieter Vander Vennet",
                    uid: 3818858,
                    "addr:housenumber": "171",
                    "addr:street": "Kortrijksestraat",
                    building: "house",
                    "source:geometry:date": "2018-10-22",
                    "source:geometry:ref": "Gbg/5096537",
                    "_last_edit:contributor": "Pieter Vander Vennet",
                    "_last_edit:contributor:uid": 3818858,
                    "_last_edit:changeset": 114571409,
                    "_last_edit:timestamp": "2021-12-05T04:04:55Z",
                    _version_number: 3,
                    id: "way/594963177",
                    _backend: "https://www.openstreetmap.org",
                    _lat: "50.83736395",
                    _lon: "3.2430937",
                    _layer: "OSM-buildings",
                    _length: "43.561938680928506",
                    "_length:km": "0.0",
                    "_now:date": "2021-12-05",
                    "_now:datetime": "2021-12-05 21:51:40",
                    "_loaded:date": "2021-12-05",
                    "_loaded:datetime": "2021-12-05 21:51:39",
                    _surface: "93.32785810484549",
                    "_surface:ha": "0"
                },
                geometry: {
                    type: "Polygon",
                    coordinates: [
                        [
                            [3.2429993, 50.8373243],
                            [3.243106, 50.8373027],
                            [3.2431527, 50.8373898],
                            [3.2431881, 50.8374009],
                            [3.2431691, 50.8374252],
                            [3.2430936, 50.837401],
                            [3.243046, 50.8374112],
                            [3.2429993, 50.8373243]
                        ]
                    ]
                },
                _lon: 3.2430937,
                _lat: 50.83736395,
                bbox: {
                    maxLat: 50.8374252,
                    maxLon: 3.2431881,
                    minLat: 50.8373027,
                    minLon: 3.2429993
                }
            }

            const p0 = turf.polygon(polyGrb.geometry.coordinates)
            expect(p0).not.toBeNull()
            const p1 = turf.polygon(polyHouse.geometry.coordinates)
            expect(p1).not.toBeNull()

            const overlaps = GeoOperations.calculateOverlap(polyGrb, [polyHouse])
            expect(overlaps).empty
            const overlapsRev = GeoOperations.calculateOverlap(polyHouse, [polyGrb])
            expect(overlapsRev).empty
        })
    })
    describe("clipWith", () => {
        it("clipWith should clip linestrings", () => {
            const bbox: Feature<Polygon> = {
                type: "Feature",
                properties: {},
                geometry: {
                    coordinates: [
                        [
                            [3.218560377159008, 51.21600586532159],
                            [3.218560377159008, 51.21499687768525],
                            [3.2207456783268356, 51.21499687768525],
                            [3.2207456783268356, 51.21600586532159],
                            [3.218560377159008, 51.21600586532159]
                        ]
                    ],
                    type: "Polygon"
                }
            }
            const line: Feature<LineString> = {
                type: "Feature",
                properties: {},
                geometry: {
                    coordinates: [
                        [3.218405371672816, 51.21499091846559],
                        [3.2208408127450525, 51.21560173433727]
                    ],
                    type: "LineString"
                }
            }
            const result = GeoOperations.clipWith(line, bbox)
            expect(result.length).to.equal(1)
            expect(result[0].geometry.type).to.eq("LineString")
            const clippedLine = (<Feature<LineString>>result[0]).geometry.coordinates
            const expCoordinates = [
                [3.2185604, 51.215029800031594],
                [3.2207457, 51.21557787977764]
            ]

            expect(clippedLine).to.deep.equal(expCoordinates)
        })
        it("clipWith should contain the full feature if it is fully contained", () => {
                const bbox: Feature<Polygon> = {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        coordinates: [
                            [
                                [
                                    2.1541744759711037,
                                    51.73994420687188
                                ],
                                [
                                    2.1541744759711037,
                                    50.31129074222787
                                ],
                                [
                                    4.53247037641421,
                                    50.31129074222787
                                ],
                                [
                                    4.53247037641421,
                                    51.73994420687188
                                ],
                                [
                                    2.1541744759711037,
                                    51.73994420687188
                                ]
                            ]
                        ],
                        type: "Polygon"
                    }
                }
                const content: Feature<Polygon> = {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "coordinates": [
                            [
                                [
                                    2.8900597545854225,
                                    50.9035099487991
                                ],
                                [
                                    3.4872999807053873,
                                    50.74856284865993
                                ],
                                [
                                    3.9512276563531543,
                                    50.947206170675486
                                ],
                                [
                                    3.897902636163167,
                                    51.25526892606362
                                ],
                                [
                                    3.188679867646016,
                                    51.24525576870511
                                ], [
                                2.8900597545854225,
                                50.9035099487991
                            ]
                            ]
                        ],
                        "type": "Polygon"
                    }
                }
                const clipped = GeoOperations.clipWith(content, bbox)
                expect(clipped.length).to.equal(1)

                const clippedReverse = GeoOperations.clipWith(bbox, content)
                expect(clippedReverse.length).to.equal(1)
            }
        )
    })
})
