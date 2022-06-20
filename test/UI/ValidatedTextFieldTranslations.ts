import {describe} from 'mocha'
import ValidatedTextField from "../../UI/Input/ValidatedTextField";
import {fail} from "assert";
import Translations from "../../UI/i18n/Translations";

describe("ValidatedTextFields", () => {

    it("should all have description in the translations", () => {
        const ts = Translations.t.validation;
        const missingTranslations = Array.from(ValidatedTextField.allTypes.keys())
            .filter(key => ts[key] === undefined || ts[key].description === undefined)
            .filter(key => key !== "distance")
        if (missingTranslations.length > 0) {
            fail("The validated text fields don't have a description defined in en.json for "+missingTranslations.join(", ")+". (Did you just add one? Run `npm run generate:translations`)")
        }
    })
})
