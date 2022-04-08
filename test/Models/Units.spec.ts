import {describe} from 'mocha'
import {expect} from 'chai'
import {Unit} from "../../Models/Unit";
import {Denomination} from "../../Models/Denomination";

describe("Unit", () => {

        it("should convert a value back and forth", () => {

            const unit = new Denomination({
                "canonicalDenomination": "MW",
                "alternativeDenomination": ["megawatts", "megawatt"],
                "human": {
                    "en": " megawatts",
                    "nl": " megawatt"
                },
                "default": true
            }, "test");

            const canonical = unit.canonicalValue("5")
            expect(canonical).eq( "5 MW")
            const units = new Unit(["key"], [unit], false)
            const [detected, detectedDenom] = units.findDenomination("5 MW")
            expect(detected).eq( "5")
            expect(detectedDenom).eq( unit)
        }
    )
})


