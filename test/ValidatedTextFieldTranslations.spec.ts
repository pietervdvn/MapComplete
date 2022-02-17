import T from "./TestHelper";
import ValidatedTextField from "../UI/Input/ValidatedTextField";
import Translations from "../UI/i18n/Translations";

export default class ValidatedTextFieldTranslationsSpec extends T {
    constructor() {
        super([
            ["Test all", () => {
                const ts = Translations.t.validation;
                console.log("Hello world!")
                const allErrors = Array.from(ValidatedTextField.allTypes.keys()).map(key => {
                    const errors = []
                    const t = ts[key]
                    if (t === undefined) {
                        errors.push("No tranlations at all for " + key)
                    }
                    return errors;
                })
                const errs = [].concat(...allErrors)
                if (errs.length > 0) {
                    errs.forEach(e => console.log(e))
                  //  throw errs.join("\n")
                }
            }]
        ]);
    }
}