import { Validator } from "../Validator"
import { Translation } from "../../i18n/Translation"
import Translations from "../../i18n/Translations"
import TagKeyValidator from "./TagKeyValidator"
import SimpleTagValidator from "./SimpleTagValidator"

/**
 * Checks that the input conforms a JSON-encoded tag expression or a simpleTag`key=value`,
 */
export default class TagValidator extends Validator {

    public readonly isMeta = true
    constructor() {
        super("tag", "A simple tag of the format `key=value` OR a tagExpression")
    }

    getFeedback(tag: string, _): Translation | undefined {
        return undefined
    }

    isValid(tag: string, _): boolean {
        return this.getFeedback(tag, _) === undefined
    }
}
