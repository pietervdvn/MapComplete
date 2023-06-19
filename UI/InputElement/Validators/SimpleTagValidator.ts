import { Validator } from "../Validator"
import { Translation } from "../../i18n/Translation"
import Translations from "../../i18n/Translations"

/**
 * Checks that the input conforms `key=value`, where `key` and `value` don't have too much weird characters
 */
export default class SimpleTagValidator extends Validator {
    constructor() {
        super(
            "simple_tag",
            "A simple tag of the format `key=value` where `key` conforms to a normal key `"
        )
    }

    getFeedback(tag: string): Translation | undefined {
        const parts = tag.split("=")
        if (parts.length < 2) {
            return Translations.T("A tag should contain a = to separate the 'key' and 'value'")
        }
        if (parts.length > 2) {
            return Translations.T(
                "A tag should contain precisely one `=` to separate the 'key' and 'value', but " +
                    (parts.length - 1) +
                    " equal signs were found"
            )
        }

        const [key, value] = parts
        if (key.length > 255) {
            return Translations.T("A `key` should be at most 255 characters")
        }
        if (value.length > 255) {
            return Translations.T("A `value should be at most 255 characters")
        }

        if (key.length == 0) {
            return Translations.T("A `key` should not be empty")
        }
        if (value.length == 0) {
            return Translations.T("A `value should not be empty")
        }

        const keyRegex = /[a-zA-Z0-9:_]+/
        if (!key.match(keyRegex)) {
            return Translations.T(
                "A `key` should only have the characters `a-zA-Z0-9`, `:`  or `_`"
            )
        }

        return undefined
    }

    isValid(tag: string): boolean {
        return this.getFeedback(tag) === undefined
    }
}
