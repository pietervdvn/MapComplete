import { Unit } from "../../src/Models/Unit"
import { Denomination } from "../../src/Models/Denomination"
import { describe, expect, it } from "vitest"
import Validators from "../../src/UI/InputElement/Validators"

describe("Unit", () => {
    it("should convert a value back and forth", () => {
        const denomintion = Denomination.fromJson(
            {
                canonicalDenomination: "MW",
                alternativeDenomination: ["megawatts", "megawatt"],
                human: {
                    en: "{quantity} megawatts",
                    nl: "{quantity} megawatt",
                },
            },
            Validators.get("float"),
            "test"
        )

        const canonical = denomintion.canonicalValue("5", true, false)
        expect(canonical).toBe("5 MW")
        const units = new Unit("quantity", ["key"], [denomintion], false, Validators.get("float"))
        const [detected, detectedDenom] = units.findDenomination("5 MW", () => "be")
        expect(detected).toBe("5")
        expect(detectedDenom).toBe(denomintion)
    })

    it("should convert an inverted value back and forth", () => {
        const denomintion = Denomination.fromJson(
            {
                canonicalDenomination: "year",
                human: {
                    en: "{quantity} year",
                    nl: "{quantity} year",
                },
            },
            Validators.get("float"),
            "test"
        )

        const canonical = denomintion.canonicalValue("5", true, true)
        expect(canonical).toBe("5/year")
        const unit = new Unit("quantity", ["key"], [denomintion], false, Validators.get("float"), true)
        const [detected, detectedDenom] = unit.findDenomination("5/year", () => "be")
        expect(detected).toBe("5")
        expect(detectedDenom).toBe(denomintion)
    })
})
