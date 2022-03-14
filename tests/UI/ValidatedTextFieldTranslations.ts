import {describe} from 'mocha'
import {expect} from 'chai'
import Translations from "../../UI/i18n/Translations";
import ValidatedTextField from "../../UI/Input/ValidatedTextField";

describe("ValidatedTextFields", () => {
    
        it("All validated text fields should have a name and description", () => {
            const ts = Translations.t.validation;
            const missingTranslations = Array.from(ValidatedTextField.allTypes.keys())
                .filter(key => ts[key] === undefined || ts[key].description === undefined)
            expect(missingTranslations, "These validated text fields don't have a type name defined in en.json. (Did you just add one? Run `npm run generate:translations`)").to.be.empty
        })
})
