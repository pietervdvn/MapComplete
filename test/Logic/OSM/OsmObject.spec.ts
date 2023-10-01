import { OsmObject } from "../../../src/Logic/Osm/OsmObject"
import { Utils } from "../../../src/Utils"
import ScriptUtils from "../../../scripts/ScriptUtils"
import { readFileSync } from "fs"
import { describe, expect, it } from "vitest"
import OsmObjectDownloader from "../../../src/Logic/Osm/OsmObjectDownloader"

describe("OsmObject", () => {
    describe("download referencing ways", () => {
        Utils.injectJsonDownloadForTests(
            "https://api.openstreetmap.org/api/0.6/node/1124134958/ways",
            {
                version: "0.6",
                generator: "CGImap 0.8.6 (49805 spike-06.openstreetmap.org)",
                copyright: "OpenStreetMap and contributors",
                attribution: "http://www.openstreetmap.org/copyright",
                license: "http://opendatacommons.org/licenses/odbl/1-0/",
                elements: [
                    {
                        type: "way",
                        id: 97038428,
                        timestamp: "2019-06-19T12:26:24Z",
                        version: 6,
                        changeset: 71399984,
                        user: "Pieter Vander Vennet",
                        uid: 3818858,
                        nodes: [1124134958, 323729212, 323729351, 2542460408, 187073405],
                        tags: {
                            highway: "residential",
                            name: "Brugs-Kerkhofstraat",
                            "sett:pattern": "arc",
                            surface: "sett",
                        },
                    },
                    {
                        type: "way",
                        id: 97038434,
                        timestamp: "2019-06-19T12:26:24Z",
                        version: 5,
                        changeset: 71399984,
                        user: "Pieter Vander Vennet",
                        uid: 3818858,
                        nodes: [1124134958, 1124135024, 187058607],
                        tags: {
                            bicycle: "use_sidepath",
                            highway: "residential",
                            name: "Kerkhofblommenstraat",
                            "sett:pattern": "arc",
                            surface: "sett",
                        },
                    },
                    {
                        type: "way",
                        id: 97038435,
                        timestamp: "2017-12-21T21:41:08Z",
                        version: 4,
                        changeset: 54826837,
                        user: "Jakka",
                        uid: 2403313,
                        nodes: [1124134958, 2576628889, 1124135035, 5298371485, 5298371495],
                        tags: {
                            bicycle: "use_sidepath",
                            highway: "residential",
                            name: "Kerkhofblommenstraat",
                        },
                    },
                    {
                        type: "way",
                        id: 251446313,
                        timestamp: "2019-01-07T19:22:47Z",
                        version: 4,
                        changeset: 66106872,
                        user: "M!dgard",
                        uid: 763799,
                        nodes: [1124134958, 5243143198, 4555715455],
                        tags: { foot: "yes", highway: "service" },
                    },
                ],
            }
        )

        it("should download referencing ways", async () => {
            const downloader = new OsmObjectDownloader()
            const ways = await downloader.DownloadReferencingWays("node/1124134958")
            expect(ways).toBeDefined()
            expect(ways).toHaveLength(4)
        })

        it("should download full OSM-relations", async () => {
            ScriptUtils.fixUtils()
            Utils.injectJsonDownloadForTests(
                "https://api.openstreetmap.org/api/0.6/relation/5759328/full",
                JSON.parse(readFileSync("./test/data/relation_5759328.json", { encoding: "utf-8" }))
            )
            const r = await new OsmObjectDownloader()
                .DownloadObjectAsync("relation/5759328")
                .then((x) => x)
            const geojson = r.asGeoJson()
            expect(geojson.geometry.type).toBe("MultiPolygon")
        })
    })
})
