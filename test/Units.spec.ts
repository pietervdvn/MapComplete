import T from "./TestHelper";
import {Denomination} from "../Customizations/JSON/Denomination";
import {equal} from "assert";

export default class UnitsSpec extends T {

    constructor() {
        super("Units", [
            ["Simple canonicalize", () => {

                const unit = new Denomination({
                    canonicalDenomination: "m",
                    alternativeDenomination: ["meter"],
                    'default': true,
                    human: {
                        en: "meter"
                    }
                }, "test")

                equal(unit.canonicalValue("42m"), "42m")
                equal(unit.canonicalValue("42"), "42m")
                equal(unit.canonicalValue("42 m"), "42m")
                equal(unit.canonicalValue("42 meter"), "42m")


            }]


        ]);

    }

}