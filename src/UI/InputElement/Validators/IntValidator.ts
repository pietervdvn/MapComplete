import { Translation } from "../../i18n/Translation"
import Translations from "../../i18n/Translations"
import { Validator } from "../Validator"

export default class IntValidator extends Validator {
    constructor(name?: string, explanation?: string) {
        super(
            name ?? "int",
            explanation ?? "A whole number, either positive, negative or zero",
            "numeric"
        )
    }

    isValid(str): boolean {
        str = "" + str
        return str !== undefined && str.indexOf(".") < 0 && !isNaN(Number(str))
    }

    getFeedback(s: string): Translation {
        const n = Number(s)
        if (isNaN(n)) {
            return Translations.t.validation.nat.notANumber
        }
        if (Math.floor(n) !== n) {
            return Translations.t.validation.nat.mustBeWhole
        }
        return undefined
    }
}
