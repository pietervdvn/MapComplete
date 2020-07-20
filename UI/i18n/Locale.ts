import { UIEventSource } from "../UIEventSource";


const LANGUAGE_KEY = 'language'

export default class Locale {
    public static language: UIEventSource<string> = new UIEventSource(Locale.getInitialLanguage())

    public static init() {
        Locale.language.addCallback(data => {
            localStorage.setItem(LANGUAGE_KEY, data)
        })
    }

    private static getInitialLanguage() {
        return localStorage.getItem(LANGUAGE_KEY)
    }
}
