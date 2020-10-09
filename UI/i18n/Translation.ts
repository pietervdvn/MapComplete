import {UIElement} from "../UIElement"
import Locale from "./Locale"
import Combine from "../Base/Combine";
import {Utils} from "../../Utils";


export default class Translation extends UIElement {

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

    public EvaluateSpecialComponents(knownSpecials: { funcName: string, constr: ((call: string) => UIElement) }[]): UIElement {
        const newTranslations = {};
        for (const lang in this.translations) {
            let template: string = this.translations[lang];

            for (const knownSpecial of knownSpecials) {


                const combined = [];
                const matched = template.match(`(.*){${knownSpecial.funcName}\\((.*)\\)}(.*)`);
                if (matched === null) {
                    continue;
                }
                const partBefore = matched[1];
                const argument = matched[2];
                const partAfter = matched[3];

                const element = knownSpecial.constr(argument).Render();

                template = partBefore + element + partAfter;
            }
            newTranslations[lang] = template;
        }
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
