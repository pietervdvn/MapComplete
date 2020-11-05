import {UIElement} from "./UIElement";
import {DropDown} from "./Input/DropDown";
import Locale from "./i18n/Locale";

export default class LanguagePicker {


    public static CreateLanguagePicker(
        languages : string[] ,
        label: string | UIElement = "") {

        if (languages.length <= 1) {
            return undefined;
        }

        return new DropDown(label, languages.map(lang => {
                return {value: lang, shown: lang}
            }
        ), Locale.language);
    }


}