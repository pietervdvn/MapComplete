import { Validator } from "../Validator"
import { Translation } from "../../i18n/Translation"
import Translations from "../../i18n/Translations"

export default class TagKeyValidator extends Validator {
    public readonly isMeta = true
    constructor() {
        super("key", "Validates a key, mostly that no weird characters are used")
    }

    getFeedback(key: string, _?: () => string): Translation | undefined {
        if (key.length > 255) {
            return Translations.T("A `key` should be at most 255 characters")
        }

        if (key.length == 0) {
            return Translations.T("A `key` should not be empty")
        }
        const keyRegex = /[a-zA-Z0-9:_]+/
        if (!key.match(keyRegex)) {
            return Translations.T(
                "A `key` should only have the characters `a-zA-Z0-9`, `:`  or `_`"
            )
        }
        return undefined
    }

    isValid(key: string, getCountry?: () => string): boolean {
        return this.getFeedback(key, getCountry) === undefined
    }
}
