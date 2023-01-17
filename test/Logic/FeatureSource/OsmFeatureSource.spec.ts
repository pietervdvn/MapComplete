import { describe } from "mocha"
import OsmFeatureSource from "../../../Logic/FeatureSource/TiledFeatureSource/OsmFeatureSource"
import { UIEventSource } from "../../../Logic/UIEventSource"
import ScriptUtils from "../../../scripts/ScriptUtils"
import FilteredLayer, { FilterState } from "../../../Models/FilteredLayer"
import { Tiles } from "../../../Models/TileRange"
import { readFileSync } from "fs"
import { Utils } from "../../../Utils"
import { Tag } from "../../../Logic/Tags/Tag"
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
import { expect } from "chai"

const expected = {
    type: "Feature",
    id: "relation/5759328",
    properties: {
        timestamp: "2022-06-10T00:46:55Z",
        version: 6,
        changeset: 122187206,
        user: "Pieter Vander Vennet",
        uid: 3818858,
        amenity: "school",
        "isced:2011:level": "vocational_lower_secondary;vocational_upper_secondary",
        name: "Koninklijk Technisch Atheneum Pro Technica",
        "school:gender": "mixed",
        type: "multipolygon",
        website: "http://ktahalle.be/",
        id: "relation/5759328",
        _backend: "https://osm.org",
    },
    geometry: {
        type: "MultiPolygon",
        coordinates: [
            [
                [
                    [4.2461832, 50.7335751],
                    [4.2463167, 50.7336785],
                    [4.2463473, 50.7337021],
                    [4.2464497, 50.7337814],
                    [4.2471698, 50.7343389],
                    [4.2469541, 50.7344768],
                    [4.2467571, 50.7346116],
                    [4.2467727, 50.7346199],
                    [4.2465714, 50.7347511],
                    [4.2462398, 50.7349687],
                    [4.2453546, 50.734601],
                    [4.2451895, 50.7345103],
                    [4.2448867, 50.7342629],
                    [4.244899, 50.7342069],
                    [4.2461832, 50.7335751],
                ],
            ],
            [
                [
                    [4.2444209, 50.7353737],
                    [4.2439986, 50.7352034],
                    [4.2440303, 50.7351755],
                    [4.2440602, 50.7351058],
                    [4.2439776, 50.7350326],
                    [4.2439558, 50.7350132],
                    [4.2438246, 50.7348961],
                    [4.2437848, 50.73486],
                    [4.2436555, 50.7347455],
                    [4.2435905, 50.734689],
                    [4.2435494, 50.7346601],
                    [4.2435038, 50.7346256],
                    [4.2434769, 50.7346026],
                    [4.2430948, 50.734275],
                    [4.2427978, 50.7340052],
                    [4.2430556, 50.7338391],
                    [4.2438957, 50.7334942],
                    [4.2440204, 50.7336368],
                    [4.2442806, 50.7338922],
                    [4.2444173, 50.7340119],
                    [4.2447379, 50.7342925],
                    [4.2450107, 50.7345294],
                    [4.2450236, 50.7346021],
                    [4.2449643, 50.7347019],
                    [4.244711, 50.7350821],
                    [4.2444209, 50.7353737],
                ],
            ],
        ],
    },
}

function test(done: () => void) {
    let fetchedTile = undefined
    const neededTiles = new UIEventSource<number[]>([Tiles.tile_index(17, 67081, 44033)])
    new OsmFeatureSource({
        allowedFeatures: new Tag("amenity", "school"),
        handleTile: (tile) => {
            fetchedTile = tile
            const data = tile.features.data[0].feature
            expect(data.properties).deep.eq({
                id: "relation/5759328",
                timestamp: "2022-06-10T00:46:55Z",
                version: 6,
                changeset: 122187206,
                user: "Pieter Vander Vennet",
                uid: 3818858,
                amenity: "school",
                "isced:2011:level": "vocational_lower_secondary;vocational_upper_secondary",
                name: "Koninklijk Technisch Atheneum Pro Technica",
                "school:gender": "mixed",
                type: "multipolygon",
                website: "http://ktahalle.be/",
                _backend: "https://osm.org",
            })
            expect(data.geometry.type).eq("MultiPolygon")
            expect(data).deep.eq(expected)
            done()
        },
        isActive: new UIEventSource<boolean>(true),
        neededTiles,
        state: {
            osmConnection: {
                Backend(): string {
                    return "https://osm.org"
                },
            },
            filteredLayers: new UIEventSource<FilteredLayer[]>([
                {
                    appliedFilters: new UIEventSource<Map<string, FilterState>>(undefined),
                    layerDef: new LayerConfig({
                        id: "school",
                        source: {
                            osmTags: "amenity=school",
                        },
                        mapRendering: null,
                    }),
                    isDisplayed: new UIEventSource<boolean>(true),
                },
            ]),
        },
    })
}

describe("OsmFeatureSource", () => {
    it("downloading the full school should give a multipolygon", (done) => {
        ScriptUtils.fixUtils()
        let data = JSON.parse(readFileSync("./test/Logic/FeatureSource/osmdata.json", "utf8"))
        Utils.injectJsonDownloadForTests(
            "https://osm.org/api/0.6/map?bbox=4.24346923828125,50.732978448277514,4.2462158203125,50.73471682490244",
            data
        )
        test(done)
    })

    it("downloading the partial school polygon should give a multipolygon", (done) => {
        ScriptUtils.fixUtils()
        Utils.injectJsonDownloadForTests(
            "https://www.openstreetmap.org/api/0.6/relation/5759328/full",
            JSON.parse(readFileSync("./test/data/relation_5759328.json", { encoding: "utf-8" }))
        )
        let data = JSON.parse(
            readFileSync("./test/Logic/FeatureSource/small_box.json", { encoding: "utf-8" })
        )
        Utils.injectJsonDownloadForTests(
            "https://osm.org/api/0.6/map?bbox=4.24346923828125,50.732978448277514,4.2462158203125,50.73471682490244",
            data
        )
        test(done)
    })
})
