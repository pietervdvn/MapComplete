import {UIEventSource} from "../UIEventSource";
import {OsmConnection} from "../../Logic/OsmConnection";


export default class Locale {
    public static language: UIEventSource<string> = Locale.getInitialLanguage();

    private static getInitialLanguage() {
        // The key to save in local storage
        const LANGUAGE_KEY = 'language'

        const lng = new UIEventSource("en");
        const saved = localStorage.getItem(LANGUAGE_KEY);
        lng.setData(saved);


        lng.addCallback(data => {
            console.log("Selected language", data);
            localStorage.setItem(LANGUAGE_KEY, data)
        });

        return lng;
    }
}
