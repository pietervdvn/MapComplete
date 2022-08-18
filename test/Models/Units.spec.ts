import {describe} from 'mocha'
import {expect} from 'chai'
import {Unit} from "../../Models/Unit";
import {Denomination} from "../../Models/Denomination";

describe("Unit", () => {

        it("should convert a value back and forth", () => {

            const denomintion = new Denomination({
                "canonicalDenomination": "MW",
                "alternativeDenomination": ["megawatts", "megawatt"],
                "human": {
                    "en": " megawatts",
                    "nl": " megawatt"
                },
            }, "test");

            const canonical = denomintion.canonicalValue("5", true)
            expect(canonical).eq( "5 MW")
            const units = new Unit(["key"], [denomintion], false)
            const [detected, detectedDenom] = units.findDenomination("5 MW", () => "be")
            expect(detected).eq( "5")
            expect(detectedDenom).eq( denomintion)
        }
    )
})


