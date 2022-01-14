import T from "./TestHelper";
import {equal} from "assert";
import {Unit} from "../Models/Unit";
import {Denomination} from "../Models/Denomination";

export default class UnitsSpec extends T {

    constructor() {
        super( [
            ["Simple canonicalize", () => {

                const unit = new Denomination({
                    canonicalDenomination: "m",
                    alternativeDenomination: ["meter"],
                    'default': true,
                    human: {
                        en: "meter"
                    }
                }, "test")

                equal(unit.canonicalValue("42m"), "42 m")
                equal(unit.canonicalValue("42"), "42 m")
                equal(unit.canonicalValue("42 m"), "42 m")
                equal(unit.canonicalValue("42 meter"), "42 m")


            }],
            ["Advanced canonicalize and back", () => {

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
                equal(canonical, "5 MW")
                const units = new Unit(["key"], [unit], false)
                const [detected, detectedDenom] = units.findDenomination("5 MW")
                equal(detected, "5")
                equal(detectedDenom, unit)
            }
            ]


        ]);

    }

}