import { Validator } from "../Validator"

export default class TranslationValidator extends Validator {
    public readonly isMeta = true
    constructor() {
        super("translation", "Makes sure the the string is of format `Record<string, string>` ")
    }

    isValid(value: string): boolean {
        try {
            JSON.parse(value)
            return true
        } catch (e) {
            return false
        }
    }
}
