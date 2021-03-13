import {UIElement} from "../UIElement";
import {FixedUiElement} from "../Base/FixedUiElement";
import AllTranslationAssets from "../../AllTranslationAssets";
import {Translation} from "./Translation";

export default class Translations {

    constructor() {
        throw "Translations is static. If you want to intitialize a new translation, use the singular form"
    }

    static t = AllTranslationAssets.t;
    public static W(s: string | UIElement): UIElement {
        if (typeof (s) === "string") {
            return new FixedUiElement(s);
        }
        return s;
    }


    static T(t: string | any, context = undefined): Translation {
        if(t === undefined){
            return undefined;
        }
        if(typeof t === "string"){
            return new Translation({"*":t}, context);
        }
        if(t.render !== undefined){
            const msg = "Creating a translation, but this object contains a 'render'-field. Use the translation directly"
            console.error(msg, t);
            throw msg
        }
        return new Translation(t, context);
    }

    private static wtcache = {}
    public static WT(s: string | Translation): Translation {
        if(s === undefined){
            return undefined;
        }
        if (typeof (s) === "string") {
            if(Translations.wtcache[s]){
                return Translations.wtcache[s];
            }
            const tr = new Translation({en: s});
            Translations.wtcache[s]=  tr;
            return tr;
        }
        if (s instanceof Translation) {
            return s;
        }
        console.error("Trying to Translation.WT, but got ",s)
        throw "??? Not a valid translation"
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

}
