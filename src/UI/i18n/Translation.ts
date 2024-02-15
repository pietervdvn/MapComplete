import Locale from "./Locale"
import { Utils } from "../../Utils"
import BaseUIElement from "../BaseUIElement"
import LinkToWeblate from "../Base/LinkToWeblate"
import { Store } from "../../Logic/UIEventSource"

export class Translation extends BaseUIElement {
    public static forcedLanguage = undefined

    public readonly translations: Record<string, string>
    public readonly context?: string
    private onDestroy: () => void

    constructor(translations: string | Record<string, string>, context?: string) {
        super()
        if (translations === undefined) {
            console.error("Translation without content at " + context)
            throw `Translation without content (${context})`
        }
        this.context = translations["_context"] ?? context

        if (typeof translations === "string") {
            translations = { "*": translations }
        }

        let count = 0
        for (const translationsKey in translations) {
            if (!translations.hasOwnProperty(translationsKey)) {
                continue
            }
            if (
                translationsKey === "_context" ||
                translationsKey === "_meta" ||
                translationsKey === "special"
            ) {
                continue
            }

            count++
            if (typeof translations[translationsKey] != "string") {
                console.error(
                    "Non-string object at",
                    context,
                    "of type",
                    typeof translations[translationsKey],
                    `for language`,
                    translationsKey,
                    `. The offending object is: `,
                    translations[translationsKey],
                    "\n    current translations are: ",
                    translations
                )
                throw (
                    "Error in an object depicting a translation: a non-string object was found. (" +
                    context +
                    ")\n    You probably put some other section accidentally in the translation"
                )
            }
        }
        this.translations = translations
        if (count === 0) {
            console.error(
                "Constructing a translation, but the object containing translations is empty " +
                    (context ?? "No context given")
            )
        }
    }

    private _current: Store<string>

    get current(): Store<string> {
        if (!this._current) {
            this._current = Locale.language.map(
                (l) => this.textFor(l),
                [],
                (f) => {
                    this.onDestroy = f
                }
            )
        }
        return this._current
    }

    get txt(): string {
        return this.textFor(Translation.forcedLanguage ?? Locale.language.data)
    }

    static ExtractAllTranslationsFrom(
        object: any,
        context = ""
    ): { context: string; tr: Translation }[] {
        const allTranslations: { context: string; tr: Translation }[] = []
        for (const key in object) {
            const v = object[key]
            if (v === undefined || v === null) {
                continue
            }
            if (v instanceof Translation) {
                allTranslations.push({ context: context + "." + key, tr: v })
                continue
            }
            if (typeof v === "object") {
                allTranslations.push(
                    ...Translation.ExtractAllTranslationsFrom(v, context + "." + key)
                )
            }
        }
        return allTranslations
    }

    static fromMap(transl: Map<string, string>) {
        const translations = {}
        let hasTranslation = false
        transl?.forEach((value, key) => {
            translations[key] = value
            hasTranslation = true
        })
        if (!hasTranslation) {
            return undefined
        }
        return new Translation(translations)
    }

    public toString() {
        return this.txt
    }

    Destroy() {
        super.Destroy()
        this.onDestroy()
        this.isDestroyed = true
    }

    public textFor(language: string): string {
        if (this.translations["*"]) {
            return this.translations["*"]
        }
        const txt = this.translations[language]
        if (txt !== undefined) {
            return txt
        }
        const en = this.translations["en"]
        if (en !== undefined) {
            return en
        }
        for (const i in this.translations) {
            if (!this.translations.hasOwnProperty(i)) {
                continue
            }
            return this.translations[i] // Return a random language
        }
        console.error("Missing language ", Locale.language.data, "for", this.translations)
        return ""
    }

    InnerConstructElement(): HTMLElement {
        const el = document.createElement("span")
        const self = this

        el.innerHTML = self.txt
        if (self.translations["*"] !== undefined) {
            return el
        }

        Locale.language.addCallback((_) => {
            if (self.isDestroyed) {
                return true
            }
            el.innerHTML = self.txt
        })

        if (self.context === undefined || self.context?.indexOf(":") < 0) {
            return el
        }

        const wrapper = document.createElement("span")
        wrapper.appendChild(el)
        Locale.showLinkToWeblate.addCallbackAndRun((doShow) => {
            if (!doShow) {
                return
            }
            const linkToWeblate = new LinkToWeblate(self.context, self.translations)
            wrapper.appendChild(linkToWeblate.ConstructElement())
            return true
        })

        return wrapper
    }

    public SupportedLanguages(): string[] {
        const langs = []
        for (const translationsKey in this.translations) {
            if (!this.translations.hasOwnProperty(translationsKey)) {
                continue
            }
            if (translationsKey === "#") {
                continue
            }
            if (!this.translations.hasOwnProperty(translationsKey)) {
                continue
            }
            langs.push(translationsKey)
        }
        return langs
    }

    public AllValues(): string[] {
        return this.SupportedLanguages().map((lng) => this.translations[lng])
    }

    /**
     * Constructs a new Translation where every contained string has been modified
     */
    public OnEveryLanguage(
        f: (s: string, language: string) => string,
        context?: string
    ): Translation {
        const newTranslations = {}
        for (const lang in this.translations) {
            if (!this.translations.hasOwnProperty(lang)) {
                continue
            }
            newTranslations[lang] = f(this.translations[lang], lang)
        }
        return new Translation(newTranslations, context ?? this.context)
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
     *
     */
    public replace(a: string, b: string) {
        return this.OnEveryLanguage((str) => str.replace(new RegExp(a, "g"), b))
    }

    public Clone() {
        return new Translation(this.translations, this.context)
    }

    /**
     * Build a new translation which only contains the first sentence of every language
     * A sentence stops at either a dot (`.`) or a HTML-break ('<br/>').
     * The dot or linebreak are _not_ returned.
     *
     * new Translation({"en": "This is a sentence. This is another sentence"}).FirstSentence().textFor("en") // "This is a sentence"
     * new Translation({"en": "This is a sentence <br/> This is another sentence"}).FirstSentence().textFor("en") // "This is a sentence"
     * new Translation({"en": "This is a sentence <br> This is another sentence"}).FirstSentence().textFor("en") // "This is a sentence"
     * new Translation({"en": "This is a sentence with a <b>bold</b> word. This is another sentence"}).FirstSentence().textFor("en") // "This is a sentence with a <b>bold</b> word"
     * @constructor
     */
    public FirstSentence(): Translation {
        const tr = {}
        for (const lng in this.translations) {
            if (!this.translations.hasOwnProperty(lng)) {
                continue
            }
            let txt = this.translations[lng]
            txt = txt.replace(/(\.|<br\/>|<br>|。).*/, "")
            txt = Utils.EllipsesAfter(txt, 255)
            tr[lng] = txt.trim()
        }

        return new Translation(tr)
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
                continue
            }
            const render = this.translations[key]

            if (isIcon) {
                const icons = render
                    .split(";")
                    .filter((part) => part.match(/(\.svg|\.png|\.jpg)$/) != null)
                allIcons.push(...icons)
            } else if (!Utils.runningFromConsole) {
                // This might be a tagrendering containing some img as html
                const htmlElement = document.createElement("div")
                htmlElement.innerHTML = render
                const images = Array.from(htmlElement.getElementsByTagName("img")).map(
                    (img) => img.src
                )
                allIcons.push(...images)
            } else {
                // We are running this in ts-node (~= nodejs), and can not access document
                // So, we fallback to simple regex
                try {
                    const matches = render.match(/<img[^>]+>/g)
                    if (matches != null) {
                        const sources = matches
                            .map((img) => img.match(/src=("[^"]+"|'[^']+'|[^/ ]+)/))
                            .filter((match) => match != null)
                            .map((match) =>
                                match[1].trim().replace(/^['"]/, "").replace(/['"]$/, "")
                            )
                        allIcons.push(...sources)
                    }
                } catch (e) {
                    console.error("Could not search for images: ", render, this.txt)
                    throw e
                }
            }
        }
        return allIcons.filter((icon) => icon != undefined)
    }

    AsMarkdown(): string {
        return this.txt
    }
}

export class TypedTranslation<T extends Record<string, any>> extends Translation {
    constructor(translations: Record<string, string>, context?: string) {
        super(translations, context)
    }

    /**
     * Substitutes text in a translation.
     * If a translation is passed, it'll be fused
     *
     * // Should replace simple keys
     * new TypedTranslation<object>({"en": "Some text {key}"}).Subs({key: "xyz"}).textFor("en") // => "Some text xyz"
     *
     * // Should fuse translations
     * const subpart = new Translation({"en": "subpart","nl":"onderdeel"})
     * const tr = new TypedTranslation<object>({"en": "Full sentence with {part}", nl: "Volledige zin met {part}"})
     * const subbed = tr.Subs({part: subpart})
     * subbed.textFor("en") // => "Full sentence with subpart"
     * subbed.textFor("nl") // => "Volledige zin met onderdeel"
     *
     */
    Subs(text: T, context?: string): Translation {
        return this.OnEveryLanguage((template, lang) => {
            if (lang === "_context") {
                return template
            }
            return Utils.SubstituteKeys(template, text, lang)
        }, context)
    }

    PartialSubs<X extends string>(
        text: Partial<T> & Record<X, string>
    ): TypedTranslation<Omit<T, X>> {
        const newTranslations: Record<string, string> = {}
        for (const lang in this.translations) {
            const template = this.translations[lang]
            if (lang === "_context") {
                newTranslations[lang] = template
                continue
            }
            newTranslations[lang] = Utils.SubstituteKeys(template, text, lang)
        }

        return new TypedTranslation<Omit<T, X>>(newTranslations, this.context)
    }

    PartialSubsTr<K extends string>(
        key: string,
        replaceWith: Translation
    ): TypedTranslation<Omit<T, K>> {
        const newTranslations: Record<string, string> = {}
        const toSearch = "{" + key + "}"
        const missingLanguages = new Set<string>(Object.keys(this.translations))
        for (const lang in this.translations) {
            missingLanguages.delete(lang)
            const template = this.translations[lang]
            if (lang === "_context") {
                newTranslations[lang] = template
                continue
            }
            const v = replaceWith.textFor(lang)
            newTranslations[lang] = template.replaceAll(toSearch, v)
        }
        const baseTemplate = this.textFor("en")
        for (const missingLanguage of missingLanguages) {
            newTranslations[missingLanguage] = baseTemplate.replaceAll(
                toSearch,
                replaceWith.textFor(missingLanguage)
            )
        }

        return new TypedTranslation<Omit<T, K>>(newTranslations, this.context)
    }
}
