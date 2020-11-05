import {UIElement} from "../UIElement";
import {FixedUiElement} from "../Base/FixedUiElement";
import Combine from "../Base/Combine";
import Locale from "./Locale";
import {Utils} from "../../Utils";
import * as TranslationsJson from "../../assets/translations.json"

export class Translation extends UIElement {

    private static forcedLanguage = undefined;

    public Subs(text: any): Translation {
        const newTranslations = {};
        for (const lang in this.translations) {
            let template: string = this.translations[lang];
            for (const k in text) {
                const combined = [];
                const parts = template.split("{" + k + "}");
                const el: string | UIElement = text[k];
                if (el === undefined) {
                    continue;
                }
                let rtext: string = "";
                if (typeof (el) === "string") {
                    rtext = el;
                } else {
                    Translation.forcedLanguage = lang; // This is a very dirty hack - it'll bite me one day
                    rtext = el.InnerRender();
                }
                for (let i = 0; i < parts.length - 1; i++) {
                    combined.push(parts[i]);
                    combined.push(rtext)
                }
                combined.push(parts[parts.length - 1]);
                template = new Combine(combined).InnerRender();
            }
            newTranslations[lang] = template;
        }
        Translation.forcedLanguage = undefined;
        return new Translation(newTranslations);

    }




    get txt(): string {
        if (this.translations["*"]) {
            return this.translations["*"];
        }
        const txt = this.translations[Translation.forcedLanguage ?? Locale.language.data];
        if (txt !== undefined) {
            return txt;
        }
        const en = this.translations["en"];
        if (en !== undefined) {
            return en;
        }
        for (const i in this.translations) {
            return this.translations[i]; // Return a random language
        }
        console.error("Missing language ",Locale.language.data,"for",this.translations)
        return undefined;
    }


    InnerRender(): string {
        return this.txt
    }

    public readonly translations: object

    constructor(translations: object) {
        super(Locale.language)
        let count = 0;
        for (const translationsKey in translations) {
            count++;
        }
        this.translations = translations
    }

    public replace(a: string, b: string) {
        if(a.startsWith("{") && a.endsWith("}")){
            a = a.substr(1, a.length - 2);
        }
        const result= this.Subs({[a]: b});
        return result;
    }

    public Clone() {
        return new Translation(this.translations)
    }


    FirstSentence() {

        const tr = {};
        for (const lng in this.translations) {
            let txt = this.translations[lng];
            txt = txt.replace(/\..*/, "");
            txt = Utils.EllipsesAfter(txt, 255);
            tr[lng] = txt;
        }

        return new Translation(tr);
    }
}

export default class Translations {

    constructor() {
        throw "Translations is static. If you want to intitialize a new translation, use the singular form"
    }

    static t = TranslationsJson;

    private static isTranslation(tr: any): boolean {
        for (const key in tr) {
            if (typeof tr[key] !== "string") {
                return false;
            }
        }
        return true;
    }

    private static InitT(): boolean {
        const queue = [Translations.t]
        while (queue.length > 0) {
            const tr = queue.pop();
            const copy = {}
            for (const subKey in tr) {
                if (Translations.isTranslation(tr[subKey])) {
                    copy[subKey] = new Translation(tr[subKey]);
                } else if(tr[subKey].translations === undefined /**should not be a translation already*/){
                    queue.push(tr[subKey]);
                }
            }
            for (const subKey in copy) {
                tr[subKey] = copy[subKey]
            }
        }
        return true;
    }

    private static isInited = Translations.InitT();


    public static W(s: string | UIElement): UIElement {
        if (typeof (s) === "string") {
            return new FixedUiElement(s);
        }
        return s;
    }


    static T(t: string | any): Translation {
        if(t === undefined){
            return undefined;
        }
        if(typeof t === "string"){
            return new Translation({"*":t});
        }
        if(t.render !== undefined){
            const msg = "Creating a translation, but this object contains a 'render'-field. Use the translation directly"
            console.error(msg, t);
            throw msg
        }
        return new Translation(t);
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
