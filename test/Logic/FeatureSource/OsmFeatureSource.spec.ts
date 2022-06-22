import {describe} from 'mocha'
import OsmFeatureSource from "../../../Logic/FeatureSource/TiledFeatureSource/OsmFeatureSource";
import {UIEventSource} from "../../../Logic/UIEventSource";
import ScriptUtils from "../../../scripts/ScriptUtils";
import FilteredLayer, {FilterState} from "../../../Models/FilteredLayer";
import {Tiles} from "../../../Models/TileRange";
import {readFileSync} from "fs";
import {Utils} from "../../../Utils";
import {Tag} from "../../../Logic/Tags/Tag";
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig";
import {expect} from "chai";

console.log(process.cwd())
let data = JSON.parse(readFileSync("./test/Logic/FeatureSource/osmdata.json", "utf8"))


describe("OsmFeatureSource", () => {

    it("should work", (done) => {
        ScriptUtils.fixUtils()
        Utils.injectJsonDownloadForTests("https://osm.org/api/0.6/map?bbox=4.24346923828125,50.732978448277514,4.2462158203125,50.73471682490244", data)
        let fetchedTile = undefined;
        const neededTiles = new UIEventSource<number[]>([Tiles.tile_index(17, 67081, 44033)]);
        new OsmFeatureSource({
            allowedFeatures: new Tag("amenity", "school"),
            handleTile: tile => {
                fetchedTile = tile
                const data = tile.features.data[0].feature
                expect(data.properties).deep.eq({
                    id: 'relation/5759328', timestamp: '2022-06-10T00:46:55Z',
                    version: 6,
                    changeset: 122187206,
                    user: 'Pieter Vander Vennet',
                    uid: 3818858,
                    amenity: 'school',
                    'isced:2011:level': 'vocational_lower_secondary;vocational_upper_secondary',
                    name: 'Koninklijk Technisch Atheneum Pro Technica',
                    'school:gender': 'mixed',
                    type: 'multipolygon',
                    website: 'http://ktahalle.be/',
                    _backend: 'https://osm.org'
                })
                expect(data.geometry.type).eq("MultiPolygon")
                done()
            },
            isActive: new UIEventSource<boolean>(true),
            neededTiles,
            state: {
                osmConnection: {
                    Backend(): string {
                        return "https://osm.org"
                    }
                },
                filteredLayers: new UIEventSource<FilteredLayer[]>([
                    {
                        appliedFilters: new UIEventSource<Map<string, FilterState>>(undefined),
                        layerDef: new LayerConfig({
                            id: "school",
                            source: {
                                osmTags: "amenity=school"
                            },
                            mapRendering: null
                        }),
                        isDisplayed: new UIEventSource<boolean>(true)
                    }
                ])
            }
        })
    })
})