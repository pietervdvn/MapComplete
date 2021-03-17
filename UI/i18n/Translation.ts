import {UIElement} from "../UIElement";
import Combine from "../Base/Combine";
import Locale from "./Locale";
import {Utils} from "../../Utils";

export class Translation extends UIElement {

    public static forcedLanguage = undefined;

    public readonly translations: object

    constructor(translations: object, context?: string) {
        super(Locale.language)
        if (translations === undefined) {
            throw `Translation without content (${context})`
        }
        let count = 0;
        for (const translationsKey in translations) {
            count++;
        }
        this.translations = translations;
        if (count === 0) {
            throw `No translations given in the object (${context})`
        }
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
        console.error("Missing language ", Locale.language.data, "for", this.translations)
        return "";
    }

    public SupportedLanguages(): string[] {
        const langs = []
        for (const translationsKey in this.translations) {
            if(translationsKey === "#"){
                continue;
            }
            langs.push(translationsKey)
        }
        return langs;
    }

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

    InnerRender(): string {
        return this.txt
    }

    public replace(a: string, b: string) {
        if (a.startsWith("{") && a.endsWith("}")) {
            a = a.substr(1, a.length - 2);
        }
        const result = this.Subs({[a]: b});
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