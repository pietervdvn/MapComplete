import { Validator } from "../Validator"
import { Translation } from "../../i18n/Translation"

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
