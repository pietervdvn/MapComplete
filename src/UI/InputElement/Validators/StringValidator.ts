import { Validator } from "../Validator"
import { Translation } from "../../i18n/Translation"
import Translations from "../../i18n/Translations"

export default class StringValidator extends Validator {

    constructor(type?: string, doc?: string, inputmode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search", textArea?: boolean) {
        super(type ?? "string",
            doc ?? "A simple piece of text which is at most 255 characters long",
            inputmode,
            textArea)
    }

    isValid(s: string): boolean {
        return s.length <= 255
    }

    getFeedback(s: string, getCountry?: () => string): Translation | undefined {
        if (s.length > 255) {
            return Translations.t.validation.tooLong.Subs({ count: s.length })
        }
        return super.getFeedback(s, getCountry)
    }
}
