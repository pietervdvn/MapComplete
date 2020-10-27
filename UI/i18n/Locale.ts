import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import {LocalStorageSource} from "../../Logic/Web/LocalStorageSource";
import {DropDown} from "../Input/DropDown";


export default class Locale {

    public static language: UIEventSource<string> = Locale.setup();

    private static setup() {
        const source = LocalStorageSource.Get('language', "en");
        if (!UIElement.runningFromConsole) {
            // @ts-ignore
            window.setLanguage = function (language: string) {
                source.setData(language)
            }
        }
        return source;
    }

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


