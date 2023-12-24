import IntValidator from "./IntValidator"
import { Translation } from "../../i18n/Translation"
import Translations from "../../i18n/Translations"

export default class NatValidator extends IntValidator {
    constructor(name?: string, explanation?: string) {
        super(name ?? "nat", explanation ?? "A  whole, positive number or zero")
    }

    isValid(str): boolean {
        if (str === undefined) {
            return false
        }
        str = "" + str

        return str.indexOf(".") < 0 && !isNaN(Number(str)) && Number(str) >= 0
    }

    /**
     *
     * const validator = new NatValidator()
     * validator.getFeedback(-4).textFor("en") // => "This number should be positive"
     */
    getFeedback(s: string): Translation {
        console.log("Getting feedback for", s)
        const n = Number(s)
        if (!isNaN(n) && n < 0) {
            return Translations.t.validation.nat.mustBePositive
        }
        const spr = super.getFeedback(s)
        if (spr !== undefined) {
            return spr
        }

        return undefined
    }
}
