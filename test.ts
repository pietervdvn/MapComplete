import {DropDown} from "./UI/Input/DropDown";
import Locale from "./UI/i18n/Locale";
import Combine from "./UI/Base/Combine";
import Translations from "./UI/i18n/Translations";

console.log("Hello world")

let languagePicker = new DropDown("", ["en", "nl"].map(lang => {
        return {value: lang, shown: lang}
    }
), Locale.language).AttachTo("maindiv");

new Combine(["abc",Translations.t.cyclofix.title, Translations.t.cyclofix.title]).AttachTo("extradiv");