import { describe, it } from "vitest"
import Validators from "../../src/UI/InputElement/Validators"

describe("validators", () => {
    it("should have a type for every validator", () => {
        const validators = Validators.AllValidators
        const knownTypes = Validators.availableTypes
        for (const knownType of knownTypes) {
            const matchingValidator = validators.find((v) => v.name === knownType)
            if (!matchingValidator) {
                throw "No validator for available type: " + knownType
            }
        }

        for (const validator of validators) {
            const matchingType = knownTypes.find((v) => v === validator.name)
            if (!matchingType) {
                throw (
                    "No matching type set Validators.availableTypes for available validator: " +
                    validator.name
                )
            }
        }
    })
})
