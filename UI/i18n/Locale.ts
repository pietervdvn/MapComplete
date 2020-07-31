import {UIEventSource} from "../UIEventSource";
import {LocalStorageSource} from "../../Logic/LocalStorageSource";
import {DropDown} from "../Input/DropDown";
import {Layout} from "../../Customizations/Layout";
import {UIElement} from "../UIElement";
import {State} from "../../State";


export default class Locale {

    public static language: UIEventSource<string> = Locale.setup();
    private static setup() {
       const source = LocalStorageSource.Get('language', "en");
        // @ts-ignore
        window.setLanguage = function (language: string) {
           source.setData(language)
        }
        return source;
    }

}


