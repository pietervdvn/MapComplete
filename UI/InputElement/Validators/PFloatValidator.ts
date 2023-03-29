import { Translation } from "../../i18n/Translation"
import Translations from "../../i18n/Translations"
import { Validator } from "../ValidatedTextField"

export default class PFloatValidator extends Validator {
    constructor() {
        super("pfloat", "A positive decimal number or zero")
    }

    isValid = (str) =>
        !isNaN(Number(str)) && Number(str) >= 0 && !str.endsWith(".") && !str.endsWith(",")

    getFeedback(s: string): Translation {
        const spr = super.getFeedback(s)
        if (spr !== undefined) {
            return spr
        }
        if (Number(s) < 0) {
            return Translations.t.validation.nat.mustBePositive
        }
        return undefined
    }
}
