import { UIEventSource } from "../UIEventSource";
import ParkingType from "../../Customizations/Questions/bike/ParkingType";


const LANGUAGE_KEY = 'language'

export default class Locale {
    const 
    public static language: UIEventSource<string> = new UIEventSource(Locale.getInitialLanguage())

    public static init() {
        Locale.language.addCallback(data => {
            localStorage.setItem(LANGUAGE_KEY, data)
            if (window.confirm('In order to change the displayed language, the page needs to be reloaded. Reload now?')) {
                location.reload()
            }
        })
    }

    private static getInitialLanguage() {
        return localStorage.getItem(LANGUAGE_KEY) || 'en'
    }
}
