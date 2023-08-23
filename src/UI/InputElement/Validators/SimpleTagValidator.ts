import { Validator } from "../Validator"
import { Translation } from "../../i18n/Translation"
import Translations from "../../i18n/Translations"
import TagKeyValidator from "./TagKeyValidator"

/**
 * Checks that the input conforms `key=value`, where `key` and `value` don't have too much weird characters
 */
export default class SimpleTagValidator extends Validator {
    private static readonly KeyValidator = new TagKeyValidator()

    public readonly isMeta = true
    constructor() {
        super(
            "simple_tag",
            "A simple tag of the format `key=value` where `key` conforms to a normal key `"
        )
    }

    getFeedback(tag: string, _): Translation | undefined {
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
        const keyFeedback = SimpleTagValidator.KeyValidator.getFeedback(key, _)
        if (keyFeedback) {
            return keyFeedback
        }

        if (value.length > 255) {
            return Translations.T("A `value should be at most 255 characters")
        }

        if (value.length == 0) {
            return Translations.T("A `value should not be empty")
        }

        return undefined
    }

    isValid(tag: string, _): boolean {
        return this.getFeedback(tag, _) === undefined
    }
}
