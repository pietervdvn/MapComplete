import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import {LocalStorageSource} from "../../Logic/Web/LocalStorageSource";


export default class Locale {

    public static language: UIEventSource<string> = Locale.setup();

    private static setup() {
        const source = LocalStorageSource.Get('language', "de");
        if (!UIElement.runningFromConsole) {
            // @ts-ignore
            window.setLanguage = function (language: string) {
                source.setData(language)
            }
        }
        return source;
    }
}


