import {DropDown} from "./UI/Input/DropDown";
import Locale from "./UI/i18n/Locale";

console.log("Hello world")

let languagePicker = new DropDown("", ["en", "nl"].map(lang => {
        return {value: lang, shown: lang}
    }
), Locale.language).AttachTo("maindiv");