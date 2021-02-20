import {UIElement} from "./UIElement";
import {DropDown} from "./Input/DropDown";
import Locale from "./i18n/Locale";
import Svg from "../Svg";
import Img from "./Base/Img";

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
        ), Locale.language, '', 'bg-indigo-100 p-1 rounded hover:bg-indigo-200');
    }


}