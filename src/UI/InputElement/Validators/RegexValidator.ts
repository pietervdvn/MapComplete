import StringValidator from "./StringValidator"
import { s } from "vitest/dist/env-afee91f0"
import { Translation } from "../../i18n/Translation"
import Translations from "../../i18n/Translations"

export default class RegexValidator extends StringValidator {
    constructor() {
        super("regex", "Validates a regex")
    }

    getFeedback(s: string): Translation | undefined {
        try {
            new RegExp(s)
        } catch (e) {
            return Translations.T("Not a valid Regex: " + e)
        }
    }

    isValid(s: string): boolean {
        return this.getFeedback(s) === undefined
    }
}
