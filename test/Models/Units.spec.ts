import { Unit } from "../../src/Models/Unit"
import { Denomination } from "../../src/Models/Denomination"
import { describe, expect, it } from "vitest"

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
            "test"
        )

        const canonical = denomintion.canonicalValue("5", true)
        expect(canonical).toBe("5 MW")
        const units = new Unit("quantity", ["key"], [denomintion], false)
        const [detected, detectedDenom] = units.findDenomination("5 MW", () => "be")
        expect(detected).toBe("5")
        expect(detectedDenom).toBe(denomintion)
    })
})
