import BaseUIElement from "../BaseUIElement"
import { Translation } from "../i18n/Translation"
import Translations from "../i18n/Translations"

/**
 * A 'TextFieldValidator' contains various methods to check and cleanup an entered value or to give feedback.
 * They also double as an index of supported types for textfields in MapComplete
 */
export abstract class Validator {
    public readonly name: string
    /*
     * An explanation for the theme builder.
     * This can indicate which special input element is used, ...
     * */
    public readonly explanation: string
    /**
     * What HTML-inputmode to use
     */
    public readonly inputmode?: string

    constructor(name: string, explanation: string | BaseUIElement, inputmode?: string) {
        this.name = name
        this.inputmode = inputmode
        if (this.name.endsWith("textfield")) {
            this.name = this.name.substr(0, this.name.length - "TextField".length)
        }
        if (this.name.endsWith("textfielddef")) {
            this.name = this.name.substr(0, this.name.length - "TextFieldDef".length)
        }
        if (typeof explanation === "string") {
            this.explanation = explanation
        } else {
            this.explanation = explanation.AsMarkdown()
        }
    }

    /**
     * Gets a piece of feedback. By default, validation.<type> will be used, resulting in a generic 'not a valid <type>'.
     * However, inheritors might overwrite this to give more specific feedback
     * @param s
     */
    public getFeedback(s: string): Translation {
        const tr = Translations.t.validation[this.name]
        if (tr !== undefined) {
            return tr["feedback"]
        }
    }

    public isValid(string: string, requestCountry: () => string): boolean {
        return true
    }

    public reformat(s: string, country?: () => string): string {
        return s
    }
}
