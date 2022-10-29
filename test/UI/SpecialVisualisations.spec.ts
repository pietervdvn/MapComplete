import { describe } from "mocha"
import SpecialVisualizations from "../../UI/SpecialVisualizations"
import { expect } from "chai"

describe("SpecialVisualisations", () => {
    describe("predifined special visualisations", () => {
        it("should not have an argument called 'type'", () => {
            const specials = SpecialVisualizations.specialVisualizations
            for (const special of specials) {
                expect(special.funcName).not.eq(
                    "type",
                    "A special visualisation is not allowed to be named 'type', as this will conflict with the 'special'-blocks"
                )

                if(special.args === undefined){
                    throw "The field 'args' is undefined for special visualisation "+special.funcName
                }

                for (const arg of special.args) {
                    expect(arg.name).not.eq(
                        "type",
                        "An argument is not allowed to be called 'type', as this will conflict with the 'special'-blocks"
                    )
                }
            }
        })
    })
})
