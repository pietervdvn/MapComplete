import { Translation } from "../../i18n/Translation"
import { Validator } from "../Validator"
import Translations from "../../i18n/Translations"

export default class IdValidator extends Validator {
    constructor() {
        super(
            "id",
            "Checks for valid identifiers for layers, will automatically replace spaces and uppercase"
        )
    }
    isValid(key: string, getCountry?: () => string): boolean {
        return this.getFeedback(key, getCountry) === undefined
    }

    reformat(s: string, _?: () => string): string {
        return s.replaceAll(" ", "_").toLowerCase()
    }

    getFeedback(s: string, _?: () => string): Translation | undefined {
        if (s.length < 3) {
            return Translations.t.validation.id.shouldBeLonger
        }
        if (!s.match(/^[a-zA-Z0-9_ ]+$/)) {
            return Translations.t.validation.id.invalidCharacter
        }
        return undefined
    }
}
