import { parsePhoneNumberFromString } from "libphonenumber-js"
import { Validator } from "../Validator"
import { Translation } from "../../i18n/Translation"
import Translations from "../../i18n/Translations"

export default class PhoneValidator extends Validator {
    constructor() {
        super("phone", "A phone number", "tel")
    }

    getFeedback(s: string, requestCountry?: () => string): Translation {
        if (this.isValid(s, requestCountry)) {
            return undefined
        }
        const tr = Translations.t.validation.phone
        const generic = tr.feedback
        if (requestCountry) {
            const country = requestCountry()
            if (country) {
                return tr.feedbackCountry.Subs({ country })
            }
        }

        return generic
    }

    public isValid(str: string, country?: () => string): boolean {
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
        if (this.isShortCode(str, countryCode)) {
            return true
        }

        return parsePhoneNumberFromString(str, countryCode)?.isValid() ?? false
    }

    public reformat(str, country: () => string) {
        if (str.startsWith("tel:")) {
            str = str.substring("tel:".length)
        }
        let countryCode = undefined
        if (country) {
            countryCode = country()
        }
        if (this.isShortCode(str, countryCode?.toUpperCase())) {
            return str
        }
        return parsePhoneNumberFromString(
            str,
            countryCode?.toUpperCase() as any
        )?.formatInternational()
    }

    /**
     * Indicates if the given string is a special 'short code' valid in the given country
     * see https://nl.wikipedia.org/wiki/Short_code
     * @param str a possible phone number
     * @param country the upper case, two-letter code for a country
     * @private
     */
    private isShortCode(str: string, country: string) {
        if (country == "BE" && str.length === 4 && str.match(/[0-9]{4}/)) {
            return true
        }
        if (country == "NL" && str.length === 4 && str.match(/14[0-9]{3}/)) {
            return true
        }
    }
}
