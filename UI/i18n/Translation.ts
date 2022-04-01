import Locale from "./Locale";
import {Utils} from "../../Utils";
import BaseUIElement from "../BaseUIElement";
import Link from "../Base/Link";
import Svg from "../../Svg";
import {VariableUiElement} from "../Base/VariableUIElement";
import LinkToWeblate from "../Base/LinkToWeblate";

export class Translation extends BaseUIElement {

    public static forcedLanguage = undefined;

    public readonly translations: object
    context?: string;

    constructor(translations: object, context?: string) {
        super()
        this.context = context;
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

        if (self.translations["*"] !== undefined || self.context === undefined || self.context?.indexOf(":") < 0) {
            return el;
        }
        
        const linkToWeblate = new LinkToWeblate(self.context, self.translations)

        const wrapper = document.createElement("span")
        wrapper.appendChild(el)
        wrapper.classList.add("flex")
        Locale.showLinkToWeblate.addCallbackAndRun(doShow => {

            if (!doShow) {
                return;
            }
            wrapper.appendChild(linkToWeblate.ConstructElement())
            return true;
        })


        return wrapper  ;
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

    /**
     * Substitutes text in a translation.
     * If a translation is passed, it'll be fused
     * 
     * // Should replace simple keys
     * new Translation({"en": "Some text {key}"}).Subs({key: "xyz"}).textFor("en") // => "Some text xyz"
     * 
     * // Should fuse translations
     * const subpart = new Translation({"en": "subpart","nl":"onderdeel"})
     * const tr = new Translation({"en": "Full sentence with {part}", nl: "Volledige zin met {part}"})
     * const subbed = tr.Subs({part: subpart})
     * subbed.textFor("en") // => "Full sentence with subpart"
     * subbed.textFor("nl") // => "Volledige zin met onderdeel"
     */
    public Subs(text: any, context?: string): Translation {
        return this.OnEveryLanguage((template, lang) => Utils.SubstituteKeys(template, text, lang), context)
    }

    public OnEveryLanguage(f: (s: string, language: string) => string, context?: string): Translation {
        const newTranslations = {};
        for (const lang in this.translations) {
            if (!this.translations.hasOwnProperty(lang)) {
                continue;
            }
            newTranslations[lang] = f(this.translations[lang], lang);
        }
        return new Translation(newTranslations, context ?? this.context);

    }
    
    /**
     * Replaces the given string with the given text in the language.
     * Other substitutions are left in place
     * 
     * const tr = new Translation(
     *      {"nl": "Een voorbeeldtekst met {key} en {key1}, en nogmaals {key}", 
     *      "en": "Just a single {key}"})
     * const r = tr.replace("{key}", "value")
     * r.textFor("nl") // => "Een voorbeeldtekst met value en {key1}, en nogmaals value"
     * r.textFor("en") // => "Just a single value"
     */
    public replace(a: string, b: string) {
        return this.OnEveryLanguage(str => str.replace(new RegExp(a, "g"), b))
    }

    public Clone() {
        return new Translation(this.translations, this.context)
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

    /**
     * Extracts all images (including HTML-images) from all the embedded translations
     * 
     * // should detect sources of <img>
     * const tr = new Translation({en: "XYZ <img src='a.svg'/> XYZ <img src=\"some image.svg\"></img> XYZ <img src=b.svg/>"})
     * new Set<string>(tr.ExtractImages(false)) // new Set(["a.svg", "b.svg", "some image.svg"])
     */
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