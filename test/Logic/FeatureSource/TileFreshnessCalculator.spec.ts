import {describe} from 'mocha'
import TileFreshnessCalculator from "../../../Logic/FeatureSource/TileFreshnessCalculator";
import {Tiles} from "../../../Models/TileRange";
import {expect} from "chai"

describe("TileFreshnessCalculator", () => {

    it("should get the freshness for loaded tiles",
        () => {
            const calc = new TileFreshnessCalculator();
            // 19/266407/175535
            const date = new Date()
            date.setTime(42)
            calc.addTileLoad(Tiles.tile_index(19, 266406, 175534), date)

            expect(calc.freshnessFor(19, 266406, 175534).getTime()).eq(42)
            expect(calc.freshnessFor(20, 266406 * 2, 175534 * 2 + 1).getTime()).eq(42)
            expect(calc.freshnessFor(19, 266406, 175535)).undefined
            expect(calc.freshnessFor(18, 266406 / 2, 175534 / 2)).undefined
            calc.addTileLoad(Tiles.tile_index(19, 266406, 175534 + 1), date)
            calc.addTileLoad(Tiles.tile_index(19, 266406 + 1, 175534), date)
            calc.addTileLoad(Tiles.tile_index(19, 266406 + 1, 175534 + 1), date)
            expect(calc.freshnessFor(18, 266406 / 2, 175534 / 2).getTime()).eq(42)
        })
})
