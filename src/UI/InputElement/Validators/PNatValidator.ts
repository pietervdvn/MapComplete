import { Translation } from "../../i18n/Translation"
import Translations from "../../i18n/Translations"
import NatValidator from "./NatValidator"

export default class PNatValidator extends NatValidator {
    constructor() {
        super("pnat", "A strict positive number")
    }

    getFeedback(s: string): Translation {
        const spr = super.getFeedback(s)
        if (spr !== undefined) {
            return spr
        }
        if (Number(s) === 0) {
            return Translations.t.validation.pnat.noZero
        }
        return undefined
    }

    isValid = (str) => {
        if (!super.isValid(str)) {
            return false
        }
        return Number(str) > 0
    }
}
