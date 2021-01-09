import {UIEventSource} from "../../Logic/UIEventSource";
import {LocalStorageSource} from "../../Logic/Web/LocalStorageSource";
import {Utils} from "../../Utils";


export default class Locale {

    public static language: UIEventSource<string> = Locale.setup();

    private static setup() {
        const source = LocalStorageSource.Get('language', "en");
        if (!Utils.runningFromConsole) {
            // @ts-ignore
            window.setLanguage = function (language: string) {
                source.setData(language)
            }
        }
        return source;
    }
}


