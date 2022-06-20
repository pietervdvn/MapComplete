import {FixedUiElement} from "../Base/FixedUiElement";
import {Translation, TypedTranslation} from "./Translation";
import BaseUIElement from "../BaseUIElement";
import * as known_languages from "../../assets/generated/used_languages.json"
import CompiledTranslations from "../../assets/generated/CompiledTranslations";

export default class Translations {

    static readonly t : typeof CompiledTranslations.t & Readonly<typeof CompiledTranslations.t> = CompiledTranslations.t;
    private static knownLanguages = new Set(known_languages.languages)
    constructor() {
        throw "Translations is static. If you want to intitialize a new translation, use the singular form"
    }

    public static W(s: string | BaseUIElement): BaseUIElement {
        if (typeof (s) === "string") {
            return new FixedUiElement(s);
        }
        if (typeof s === "number") {
            return new FixedUiElement("" + s)
        }
        return s;
    }

    /**
     * Converts a string or an object into a typed translation.
     * Translation objects ('Translation' and 'TypedTranslation') are converted/returned
     * 
     * Translations.T("some text") // => new TypedTranslation({"*": "some text"})
     * Translations.T("some text").txt // => "some text"
     *
     * const t = new Translation({"nl": "vertaling", "en": "translation"})
     * Translations.T(t) // => new TypedTranslation<object>({"nl": "vertaling", "en": "translation"})
     * 
     * const t = new TypedTranslation({"nl": "vertaling", "en": "translation"})
     * Translations.T(t) // => t
     * 
     * const json: any = {"en": "English", "nl": "Nederlands"};
     * const translation = Translations.T(new Translation(json));
     * translation.textFor("en") // => "English"
     * translation.textFor("nl") // => "Nederlands"
     * 
     */
    static T(t: string | any, context = undefined): TypedTranslation<object> {
        if (t === undefined || t === null) {
            return undefined;
        }
        if (typeof t === "number") {
            t = "" + t
        }
        if (typeof t === "string") {
            return new TypedTranslation<object>({"*": t}, context);
        }
        if (t.render !== undefined) {
            const msg = "Creating a translation, but this object contains a 'render'-field. Use the translation directly"
            console.error(msg, t);
            throw msg
        }
        if (t instanceof TypedTranslation) {
            return t;
        }
        if(t instanceof Translation){
            return new TypedTranslation<object>(t.translations)
        }
        return new TypedTranslation<object>(t, context);
    }


    public static CountTranslations() {
        const queue: any = [Translations.t];
        const tr: Translation[] = [];
        while (queue.length > 0) {
            const item = queue.pop();
            if (item instanceof Translation || item.translations !== undefined) {
                tr.push(item);
            } else if (typeof (item) === "string") {
                console.warn("Got single string in translationgs file: ", item);
            } else {
                for (const t in item) {
                    const x = item[t];
                    queue.push(x)
                }
            }
        }

        const langaugeCounts = {};
        for (const translation of tr) {
            for (const language in translation.translations) {
                if (langaugeCounts[language] === undefined) {
                    langaugeCounts[language] = 1
                } else {
                    langaugeCounts[language]++;
                }
            }
        }
        for (const language in langaugeCounts) {
            console.log("Total translations in ", language, langaugeCounts[language], "/", tr.length)
        }

    }

    static isProbablyATranslation(transl: any) {
        if(typeof transl !== "object"){
            return false;
        }
        if(Object.keys(transl).length == 0){
            // No translations found; not a translation
            return false
        }
        // is a weird key found?
        if(Object.keys(transl).some(key => key !== '_context' && !this.knownLanguages.has(key))){
            return false
        }
        
        return true;
    }
}
