import { Translation } from "../../i18n/Translation"
import Translations from "../../i18n/Translations"
import { Validator } from "../Validator"

export default class FloatValidator extends Validator {
    inputmode = "decimal"

    constructor(name?: string, explanation?: string) {
        super(name ?? "float", explanation ?? "A decimal number", "decimal")
    }

    isValid(str) {
        return !isNaN(Number(str)) && !str.endsWith(".") && !str.endsWith(",")
    }

    reformat(str): string {
        return "" + Number(str)
    }

    getFeedback(s: string): Translation {
        if (isNaN(Number(s))) {
            return Translations.t.validation.nat.notANumber
        }

        return undefined
    }
}
