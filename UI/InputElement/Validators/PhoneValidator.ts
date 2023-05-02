import {parsePhoneNumberFromString} from "libphonenumber-js"
import {Validator} from "../Validator"
import {Translation} from "../../i18n/Translation";
import Translations from "../../i18n/Translations";

export default class PhoneValidator extends Validator {
    constructor() {
        super("phone", "A phone number", "tel")
    }


    getFeedback(s: string, requestCountry?: () => string): Translation {
        const tr = Translations.t.validation.phone
        const generic = tr.feedback
        if(requestCountry){
        const country = requestCountry()
            if(country){
                return  tr.feedbackCountry.Subs({country})
            }
        }

        return generic
    }

    public isValid(str, country: () => string): boolean {
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

    public reformat(str, country: () => string) {
        if (str.startsWith("tel:")) {
            str = str.substring("tel:".length)
        }
        let countryCode = undefined
        if(country){
            countryCode = country()
        }
        return parsePhoneNumberFromString(
            str,
            countryCode?.toUpperCase() as any
        )?.formatInternational()
    }
}
