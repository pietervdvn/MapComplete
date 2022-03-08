import Locale from "./Locale";
import {Utils} from "../../Utils";
import BaseUIElement from "../BaseUIElement";

export class Translation extends BaseUIElement {

    public static forcedLanguage = undefined;

    public readonly translations: object

    constructor(translations: object, context?: string) {
        super()
        if (translations === undefined) {
            console.error("Translation without content at "+context)
            throw `Translation without content (${context})`
        }
        if (typeof translations === "string") {
            translations = {"*": translations};
        }
        let count = 0;
        for (const translationsKey in translations) {
            if (!translations.hasOwnProperty(translationsKey)) {
                continue
            }
            count++;
            if (typeof (translations[translationsKey]) != "string") {
                console.error("Non-string object in translation: ", translations[translationsKey])
                throw "Error in an object depicting a translation: a non-string object was found. (" + context + ")\n    You probably put some other section accidentally in the translation"
            }
        }
        this.translations = translations;
        if (count === 0) {
            console.error("Constructing a translation, but the object containing translations is empty "+context)
            throw `Constructing a translation, but the object containing translations is empty (${context})`
        }
    }

    get txt(): string {
        return this.textFor(Translation.forcedLanguage ?? Locale.language.data)
    }   

    static ExtractAllTranslationsFrom(object: any, context = ""): { context: string, tr: Translation }[] {
        const allTranslations: { context: string, tr: Translation }[] = []
        for (const key in object) {
            const v = object[key]
            if (v === undefined || v === null) {
                continue
            }
            if (v instanceof Translation) {
                allTranslations.push({context: context + "." + key, tr: v})
                continue
            }
            if (typeof v === "object") {
                allTranslations.push(...Translation.ExtractAllTranslationsFrom(v, context + "." + key))

            }
        }
        return allTranslations
    }

    static fromMap(transl: Map<string, string>) {
        const translations = {}
        let hasTranslation = false;
        transl?.forEach((value, key) => {
            translations[key] = value
            hasTranslation = true
        })
        if (!hasTranslation) {
            return undefined
        }
        return new Translation(translations);
    }

    Destroy() {
        super.Destroy();
        this.isDestroyed = true;
    }

    public textFor(language: string): string {
        if (this.translations["*"]) {
            return this.translations["*"];
        }
        const txt = this.translations[language];
        if (txt !== undefined) {
            return txt;
        }
        const en = this.translations["en"];
        if (en !== undefined) {
            return en;
        }
        for (const i in this.translations) {
            if (!this.translations.hasOwnProperty(i)) {
                continue;
            }
            return this.translations[i]; // Return a random language
        }
        console.error("Missing language ", Locale.language.data, "for", this.translations)
        return "";
    }

    InnerConstructElement(): HTMLElement {
        const el = document.createElement("span")
        const self = this
        Locale.language.addCallbackAndRun(_ => {
            if (self.isDestroyed) {
                return true
            }
            el.innerHTML = this.txt
        })
        return el;
    }

    public SupportedLanguages(): string[] {
        const langs = []
        for (const translationsKey in this.translations) {
            if (!this.translations.hasOwnProperty(translationsKey)) {
                continue;
            }
            if (translationsKey === "#") {
                continue;
            }
            if (!this.translations.hasOwnProperty(translationsKey)) {
                continue
            }
            langs.push(translationsKey)
        }
        return langs;
    }

    public AllValues(): string[] {
        return this.SupportedLanguages().map(lng => this.translations[lng]);
    }

    public Subs(text: any): Translation {
        return this.OnEveryLanguage((template, lang) => Utils.SubstituteKeys(template, text, lang))
    }

    public OnEveryLanguage(f: (s: string, language: string) => string): Translation {
        const newTranslations = {};
        for (const lang in this.translations) {
            if (!this.translations.hasOwnProperty(lang)) {
                continue;
            }
            newTranslations[lang] = f(this.translations[lang], lang);
        }
        return new Translation(newTranslations);

    }

    /**
     * 
     * Given a translation such as `{en: "How much of bicycle_types are rented here}` (which is this translation)
     * and a translation object `{ en: "electrical bikes" }`, plus the translation specification `bicycle_types`, will return 
     * a new translation:
     * `{en: "How much electrical bikes are rented here?"}`
     * 
     * @param translationObject
     * @param stringToReplace
     * @constructor
     */
    public Fuse(translationObject: Translation, stringToReplace: string): Translation{
        const translations = this.translations
        const newTranslations = {}
        for (const lang in translations) {
            const target = translationObject.textFor(lang)
            if(target === undefined){
                continue
            }
            if(typeof target !== "string"){
                throw "Invalid object in Translation.fuse: translationObject['"+lang+"'] is not a string, it is: "+JSON.stringify(target)
            }
            newTranslations[lang] = this.translations[lang].replaceAll(stringToReplace, target)
        }
        return new Translation(newTranslations)
    }

    public replace(a: string, b: string) {
        if (a.startsWith("{") && a.endsWith("}")) {
            a = a.substr(1, a.length - 2);
        }
        return this.Subs({[a]: b});
    }

    public Clone() {
        return new Translation(this.translations)
    }

    FirstSentence() {

        const tr = {};
        for (const lng in this.translations) {
            if (!this.translations.hasOwnProperty(lng)) {
                continue
            }
            let txt = this.translations[lng];
            txt = txt.replace(/\..*/, "");
            txt = Utils.EllipsesAfter(txt, 255);
            tr[lng] = txt;
        }

        return new Translation(tr);
    }

    public ExtractImages(isIcon = false): string[] {
        const allIcons: string[] = []
        for (const key in this.translations) {
            if (!this.translations.hasOwnProperty(key)) {
                continue;
            }
            const render = this.translations[key]

            if (isIcon) {
                const icons = render.split(";").filter(part => part.match(/(\.svg|\.png|\.jpg)$/) != null)
                allIcons.push(...icons)
            } else if (!Utils.runningFromConsole) {
                // This might be a tagrendering containing some img as html
                const htmlElement = document.createElement("div")
                htmlElement.innerHTML = render
                const images = Array.from(htmlElement.getElementsByTagName("img")).map(img => img.src)
                allIcons.push(...images)
            } else {
                // We are running this in ts-node (~= nodejs), and can not access document
                // So, we fallback to simple regex
                try {
                    const matches = render.match(/<img[^>]+>/g)
                    if (matches != null) {
                        const sources = matches.map(img => img.match(/src=("[^"]+"|'[^']+'|[^/ ]+)/))
                            .filter(match => match != null)
                            .map(match => match[1].trim().replace(/^['"]/, '').replace(/['"]$/, ''));
                        allIcons.push(...sources)
                    }
                } catch (e) {
                    console.error("Could not search for images: ", render, this.txt)
                    throw e
                }
            }
        }
        return allIcons.filter(icon => icon != undefined)
    }

    AsMarkdown(): string {
        return this.txt
    }
}