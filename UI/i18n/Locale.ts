import {UIEventSource} from "../UIEventSource";
import {LocalStorageSource} from "../../Logic/LocalStorageSource";
import {DropDown} from "../Input/DropDown";
import {Layout} from "../../Customizations/Layout";
import {UIElement} from "../UIElement";


export default class Locale {
    public static language: UIEventSource<string> = LocalStorageSource.Get('language', "en");

    public static CreateLanguagePicker(layoutToUse: Layout, label: string | UIElement = "") {

        return new DropDown(label, layoutToUse.supportedLanguages.map(lang => {
                return {value: lang, shown: lang}
            }
        ), Locale.language);
    }
}


