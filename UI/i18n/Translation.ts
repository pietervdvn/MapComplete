import Locale from "./Locale";
import {Utils} from "../../Utils";
import BaseUIElement from "../BaseUIElement";

export class Translation extends BaseUIElement {

    public static forcedLanguage = undefined;

    public readonly translations: object

    constructor(translations: object, context?: string) {
        super()
        if (translations === undefined) {
            throw `Translation without content (${context})`
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
            throw `No translations given in the object (${context})`
        }
    }

    get txt(): string {
      return this.textFor(Translation.forcedLanguage ?? Locale.language.data)
    }
    
    public textFor(language: string): string{
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
        Locale.language.addCallbackAndRun(_ => {
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
            if(!this.translations.hasOwnProperty(translationsKey)){
                continue
            }
            langs.push(translationsKey)
        }
        return langs;
    }

    public Subs(text: any): Translation {
        const newTranslations = {};
        for (const lang in this.translations) {
            if (!this.translations.hasOwnProperty(lang)) {
                continue;
            }
            let template: string = this.translations[lang];
            for (const k in text) {
                if (!text.hasOwnProperty(k)) {
                    continue
                }
                const combined: (string)[] = [];
                const parts = template.split("{" + k + "}");
                const el: string | BaseUIElement = text[k];
                if (el === undefined) {
                    continue;
                }
                let rtext: string = "";
                if (typeof (el) === "string") {
                    rtext = el;
                } else if (typeof (el) === "number") {
                    // HUH? Where did that number come from? It might be a version number or something calculated
                    rtext = "" + el;
                } else if (el["toISOString"] != undefined) {
                    // This is a date, probably the timestamp of the object
                    // @ts-ignore
                    const date: Date = el;
                    rtext = date.toLocaleString();
                } else if (el.ConstructElement === undefined) {
                    console.error("ConstructElement is not defined", el);
                    throw "ConstructElement is not defined, you are working with a "+(typeof el)+":"+(el.constructor.name)
                } else {
                    Translation.forcedLanguage = lang; // This is a very dirty hack - it'll bite me one day
                    rtext = el.ConstructElement().innerHTML;

                }
                for (let i = 0; i < parts.length - 1; i++) {
                    combined.push(parts[i]);
                    combined.push(rtext)
                }
                combined.push(parts[parts.length - 1]);
                template = combined.join("")
            }
            newTranslations[lang] = template;
        }
        Translation.forcedLanguage = undefined;
        return new Translation(newTranslations);

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
    
}