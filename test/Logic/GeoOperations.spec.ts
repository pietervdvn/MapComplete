import {describe} from 'mocha'
import {expect} from 'chai'
import * as turf from "@turf/turf";
import {GeoOperations} from "../../Logic/GeoOperations";

describe("GeoOperations", () => {
    
    describe("calculateOverlap", () => {
        it("should not give too much overlap (regression test)", () => {
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
            expect(p0).not.null
            const p1 = turf.polygon(polyHouse.geometry.coordinates)
            expect(p1).not.null


            const overlaps = GeoOperations.calculateOverlap(polyGrb, [polyHouse])
            expect(overlaps).empty
            const overlapsRev = GeoOperations.calculateOverlap(polyHouse, [polyGrb])
            expect(overlapsRev).empty
        })
    })
})