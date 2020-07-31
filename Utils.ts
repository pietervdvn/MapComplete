import {UIElement} from "./UI/UIElement";
import {DropDown} from "./UI/Input/DropDown";
import {State} from "./State";
import Locale from "./UI/i18n/Locale";

export class Utils {

    /**
     * Gives a clean float, or undefined if parsing fails
     * @param str
     */
    static asFloat(str): number {
        if (str) {
            const i = parseFloat(str);
            if (isNaN(i)) {
                return undefined;
            }
            return i;
        }
        return undefined;
    }
    
    public static Upper(str : string){
        return str.substr(0,1).toUpperCase() + str.substr(1);
    }

    static DoEvery(millis: number, f: (() => void)) {
        if(State.runningFromConsole){
            return;
        }
        window.setTimeout(
            function () {
                f();
                Utils.DoEvery(millis, f);
            }
            , millis)
    }

    public static CreateLanguagePicker(label: string | UIElement = "") {

        return new DropDown(label, State.state.layoutToUse.data.supportedLanguages.map(lang => {
                return {value: lang, shown: lang}
            }
        ), Locale.language);
    }

}
