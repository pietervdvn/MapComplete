import {UIEventSource} from "../UIEventSource";
import {LocalStorageSource} from "../../Logic/LocalStorageSource";


export default class Locale {
    public static language: UIEventSource<string> = LocalStorageSource.Get('language', "en");
}
