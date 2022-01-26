import T from "./TestHelper";
import TileFreshnessCalculator from "../Logic/FeatureSource/TileFreshnessCalculator";
import {Tiles} from "../Models/TileRange";
import {equal} from "assert";

export default class TileFreshnessCalculatorSpec extends T {

    constructor() {
        super([
            [
                "TileFresnessTests",
                () => {
                    const calc = new TileFreshnessCalculator();
                    // 19/266407/175535
                    const date = new Date()
                    date.setTime(42)
                    calc.addTileLoad(Tiles.tile_index(19, 266406, 175534), date)
                    equal(42, calc.freshnessFor(19, 266406, 175534).getTime())
                    equal(42, calc.freshnessFor(20, 266406 * 2, 175534 * 2 + 1).getTime())
                    equal(undefined, calc.freshnessFor(19, 266406, 175535))
                    equal(undefined, calc.freshnessFor(18, 266406 / 2, 175534 / 2))
                    calc.addTileLoad(Tiles.tile_index(19, 266406, 175534 + 1), date)
                    calc.addTileLoad(Tiles.tile_index(19, 266406 + 1, 175534), date)
                    calc.addTileLoad(Tiles.tile_index(19, 266406 + 1, 175534 + 1), date)
                    equal(42, calc.freshnessFor(18, 266406 / 2, 175534 / 2).getTime())
                }
            ]
        ])
    }

}