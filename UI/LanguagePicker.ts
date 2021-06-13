import {DropDown} from "./Input/DropDown";
import Locale from "./i18n/Locale";
import BaseUIElement from "./BaseUIElement";

export default class LanguagePicker {
    

    public static CreateLanguagePicker(
        languages : string[] ,
        label: string | BaseUIElement = "") {

        if (languages.length <= 1) {
            return undefined;
        }
        
        return new DropDown(label, languages.map(lang => {
                return {value: lang, shown: lang}
            }
        ), Locale.language, { select_class: 'bg-indigo-100 p-1 rounded hover:bg-indigo-200'});
    }


}