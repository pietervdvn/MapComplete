import { Validator } from "../ValidatedTextField"
import { parsePhoneNumberFromString } from "libphonenumber-js"

export default class PhoneValidator extends Validator {
    constructor() {
        super("phone", "A phone number", "tel")
    }

    isValid(str, country: () => string): boolean {
        if (str === undefined) {
            return false
        }
        if (str.startsWith("tel:")) {
            str = str.substring("tel:".length)
        }
        let countryCode = undefined
        if (country !== undefined) {
            countryCode = country()?.toUpperCase()
        }
        return parsePhoneNumberFromString(str, countryCode)?.isValid() ?? false
    }

    reformat = (str, country: () => string) => {
        if (str.startsWith("tel:")) {
            str = str.substring("tel:".length)
        }
        return parsePhoneNumberFromString(
            str,
            country()?.toUpperCase() as any
        )?.formatInternational()
    }
}
