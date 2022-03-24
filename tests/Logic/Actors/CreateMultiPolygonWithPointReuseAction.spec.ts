import {describe} from 'mocha'
import {expect} from 'chai'
import CreateMultiPolygonWithPointReuseAction from "../../../Logic/Osm/Actions/CreateMultiPolygonWithPointReuseAction";
import {Tag} from "../../../Logic/Tags/Tag";
import {Changes} from "../../../Logic/Osm/Changes";

describe("CreateMultiPolygonWithPointReuseAction", () => {
    
        it("should produce a correct changeset", () => {

            async () => {

                const feature = {
                    "type": "Feature",
                    "properties": {
                        "osm_id": "41097039",
                        "size_grb_building": "1374.89",
                        "addr:housenumber": "53",
                        "addr:street": "Startelstraat",
                        "building": "house",
                        "source:geometry:entity": "Gbg",
                        "source:geometry:date": "2014-04-28",
                        "source:geometry:oidn": "150044",
                        "source:geometry:uidn": "5403181",
                        "H_DTM_MIN": "50.35",
                        "H_DTM_GEM": "50.97",
                        "H_DSM_MAX": "59.40",
                        "H_DSM_P99": "59.09",
                        "HN_MAX": "8.43",
                        "HN_P99": "8.12",
                        "detection_method": "derived from OSM landuse: farmyard",
                        "auto_target_landuse": "farmyard",
                        "size_source_landuse": "8246.28",
                        "auto_building": "farm",
                        "id": "41097039",
                        "_lat": "50.84633355000016",
                        "_lon": "5.262964150000011",
                        "_layer": "grb",
                        "_length": "185.06002152312757",
                        "_length:km": "0.2",
                        "_now:date": "2022-02-22",
                        "_now:datetime": "2022-02-22 10:15:51",
                        "_loaded:date": "2022-02-22",
                        "_loaded:datetime": "2022-02-22 10:15:51",
                        "_geometry:type": "Polygon",
                        "_intersects_with_other_features": "",
                        "_country": "be",
                        "_overlaps_with_buildings": "[]",
                        "_overlap_percentage": "null",
                        "_grb_date": "2014-04-28",
                        "_grb_ref": "Gbg/150044",
                        "_building:min_level": "",
                        "_surface": "548.1242491529038",
                        "_surface:ha": "0",
                        "_reverse_overlap_percentage": "null",
                        "_imported_osm_object_found": "false",
                        "_imported_osm_still_fresh": "false",
                        "_target_building_type": "house"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": <[number, number][][]>[
                            [
                                [
                                    5.262684300000043,
                                    50.84624409999995
                                ],
                                [
                                    5.262777500000024,
                                    50.84620759999988
                                ],
                                [
                                    5.262798899999998,
                                    50.84621390000019
                                ],
                                [
                                    5.262999799999994,
                                    50.84619519999999
                                ],
                                [
                                    5.263107500000007,
                                    50.84618920000014
                                ],
                                [
                                    5.263115,
                                    50.84620990000026
                                ],
                                [
                                    5.26310279999998,
                                    50.84623050000014
                                ],
                                [
                                    5.263117999999977,
                                    50.846247400000166
                                ],
                                [
                                    5.263174599999989,
                                    50.84631019999971
                                ],
                                [
                                    5.263166999999989,
                                    50.84631459999995
                                ],
                                [
                                    5.263243999999979,
                                    50.84640239999989
                                ],
                                [
                                    5.2631607000000065,
                                    50.84643459999996
                                ],
                                [
                                    5.26313309999997,
                                    50.84640089999985
                                ],
                                [
                                    5.262907499999996,
                                    50.84647790000018
                                ],
                                [
                                    5.2628939999999576,
                                    50.846463699999774
                                ],
                                [
                                    5.262872100000033,
                                    50.846440700000294
                                ],
                                [
                                    5.262784699999991,
                                    50.846348899999924
                                ],
                                [
                                    5.262684300000043,
                                    50.84624409999995
                                ]
                            ],
                            [
                                [
                                    5.262801899999976,
                                    50.84623269999982
                                ],
                                [
                                    5.2629535000000285,
                                    50.84638830000012
                                ],
                                [
                                    5.263070700000018,
                                    50.84634720000008
                                ],
                                [
                                    5.262998000000025,
                                    50.84626279999982
                                ],
                                [
                                    5.263066799999966,
                                    50.84623959999975
                                ],
                                [
                                    5.263064000000004,
                                    50.84623330000007
                                ],
                                [
                                    5.263009599999997,
                                    50.84623730000026
                                ],
                                [
                                    5.263010199999956,
                                    50.84621629999986
                                ],
                                [
                                    5.262801899999976,
                                    50.84623269999982
                                ]
                            ]
                        ]
                    },
                }

                const innerRings = [...feature.geometry.coordinates]
                innerRings.splice(0, 1)

                const action = new CreateMultiPolygonWithPointReuseAction(
                    [new Tag("building", "yes")],
                    feature.geometry.coordinates[0],
                    innerRings,
                    undefined,
                    [],
                    "import"
                )
                const descriptions = await action.Perform(new Changes())

                const ways= descriptions.filter(d => d.type === "way")
                expect(ways[0].id == -18, "unexpected id").true
                expect(ways[1].id == -27, "unexpected id").true
                const outer = ways[0].changes["coordinates"]
                expect(outer).deep.equal(feature.geometry.coordinates[0])
                const inner = ways[1].changes["coordinates"]
                expect(inner).deep.equal(feature.geometry.coordinates[1])
                const members = <{type: string, role: string, ref: number}[]> descriptions.find(d => d.type === "relation").changes["members"]
                expect(members[0].role, "incorrect role").eq("outer")
                expect(members[1].role, "incorrect role").eq("inner")
                expect(members[0].type , "incorrect type").eq("way")
                expect(members[1].type , "incorrect type").eq("way")
                expect(members[0].ref, "incorrect id").eq(-18)
                expect(members[1].ref , "incorrect id").eq(-27)
            }
            
        })
})