import { GeoOperations } from "../../src/Logic/GeoOperations"
import { Feature, LineString, Polygon } from "geojson"
import { describe, expect, it } from "vitest"

describe("GeoOperations", () => {
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
                            [3.218560377159008, 51.21600586532159],
                        ],
                    ],
                    type: "Polygon",
                },
            }
            const line: Feature<LineString> = {
                type: "Feature",
                properties: {},
                geometry: {
                    coordinates: [
                        [3.218405371672816, 51.21499091846559],
                        [3.2208408127450525, 51.21560173433727],
                    ],
                    type: "LineString",
                },
            }
            const result = GeoOperations.clipWith(line, bbox)
            expect(result.length).to.equal(1)
            expect(result[0].geometry.type).to.eq("LineString")
            const clippedLine = (<Feature<LineString>>result[0]).geometry.coordinates
            const expCoordinates = [
                [3.2185604, 51.215029800031594],
                [3.2207457, 51.21557787977764],
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
                            [2.1541744759711037, 51.73994420687188],
                            [2.1541744759711037, 50.31129074222787],
                            [4.53247037641421, 50.31129074222787],
                            [4.53247037641421, 51.73994420687188],
                            [2.1541744759711037, 51.73994420687188],
                        ],
                    ],
                    type: "Polygon",
                },
            }
            const content: Feature<Polygon> = {
                type: "Feature",
                properties: {},
                geometry: {
                    coordinates: [
                        [
                            [2.8900597545854225, 50.9035099487991],
                            [3.4872999807053873, 50.74856284865993],
                            [3.9512276563531543, 50.947206170675486],
                            [3.897902636163167, 51.25526892606362],
                            [3.188679867646016, 51.24525576870511],
                            [2.8900597545854225, 50.9035099487991],
                        ],
                    ],
                    type: "Polygon",
                },
            }
            const clipped = GeoOperations.clipWith(content, bbox)
            expect(clipped.length).to.equal(1)

            const clippedReverse = GeoOperations.clipWith(bbox, content)
            expect(clippedReverse.length).to.equal(1)
        })
    })
})
