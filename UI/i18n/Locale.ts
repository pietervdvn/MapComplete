import {UIEventSource} from "../../Logic/UIEventSource";
import {LocalStorageSource} from "../../Logic/Web/LocalStorageSource";
import {Utils} from "../../Utils";
import {QueryParameters} from "../../Logic/Web/QueryParameters";


export default class Locale {

    public static language: UIEventSource<string> = Locale.setup();

    private static setup() {
        const source = LocalStorageSource.Get('language', "en");
        if (!Utils.runningFromConsole) {
            // @ts-ignore
            window.setLanguage = function (language: string) {
                source.setData(language)
            }
            source.syncWith(
                QueryParameters.GetQueryParameter("language", undefined, "The language to display mapcomplete in. Will be ignored in case a logged-in-user did set their language before. If the specified language does not exist, it will default to the first language in the theme."),
                true
            )
        }
        return source;
    }
}


