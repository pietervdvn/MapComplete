import {UIEventSource} from "../UIEventSource";
import {LocalStorageSource} from "../../Logic/LocalStorageSource";
import {UIElement} from "../UIElement";


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

}


