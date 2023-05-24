import SpecialVisualizations from "../../UI/SpecialVisualizations"
import { describe, expect, it } from "vitest"

describe("SpecialVisualisations", () => {
    describe("predifined special visualisations", () => {
        it("should not have an argument called 'type'", () => {
            const specials = SpecialVisualizations.specialVisualizations
            for (const special of specials) {
                expect(special.funcName).not.toBe("type")

                if (special.args === undefined) {
                    throw (
                        "The field 'args' is undefined for special visualisation " +
                        special.funcName
                    )
                }

                for (const arg of special.args) {
                    expect(arg.name).not.toBe("type")
                }
            }
        })
    })
})
