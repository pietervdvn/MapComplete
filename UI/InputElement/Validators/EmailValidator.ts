import { Validator } from "../ValidatedTextField.js"
import { Translation } from "../../i18n/Translation.js"
import Translations from "../../i18n/Translations.js"
import * as emailValidatorLibrary from "email-validator"
export default class EmailValidator extends Validator {
    constructor() {
        super("email", "An email adress", "email")
    }

    isValid = (str) => {
        if (str === undefined) {
            return false
        }
        str = str.trim()
        if (str.startsWith("mailto:")) {
            str = str.substring("mailto:".length)
        }
        return emailValidatorLibrary.validate(str)
    }

    reformat = (str) => {
        if (str === undefined) {
            return undefined
        }
        str = str.trim()
        if (str.startsWith("mailto:")) {
            str = str.substring("mailto:".length)
        }
        return str
    }

    getFeedback(s: string): Translation {
        if (s.indexOf("@") < 0) {
            return Translations.t.validation.email.noAt
        }

        return super.getFeedback(s)
    }
}
