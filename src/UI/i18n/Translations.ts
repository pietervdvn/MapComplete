import { FixedUiElement } from "../Base/FixedUiElement"
import { Translation, TypedTranslation } from "./Translation"
import BaseUIElement from "../BaseUIElement"
import CompiledTranslations from "../../assets/generated/CompiledTranslations"
import LanguageUtils from "../../Utils/LanguageUtils"
import { ClickableToggle } from "../Input/Toggle"
import { Store } from "../../Logic/UIEventSource"
import Locale from "./Locale"
import { Utils } from "../../Utils"

export default class Translations {
    static readonly t: Readonly<typeof CompiledTranslations.t> = CompiledTranslations.t
    private static knownLanguages = LanguageUtils.usedLanguages

    constructor() {
        throw "Translations is static. If you want to intitialize a new translation, use the singular form"
    }

    public static W(s: string | number | boolean | BaseUIElement): BaseUIElement {
        if (typeof s === "string") {
            return new FixedUiElement(s)
        }
        if (typeof s === "number") {
            return new FixedUiElement("" + s).SetClass("font-bold")
        }
        if (typeof s === "boolean") {
            return new FixedUiElement("" + s).SetClass("font-bold")
        }
        if (typeof s === "object") {
            if (s.ConstructElement) {
                return s
            }
            const v = JSON.stringify(s)
            if (v.length > 100) {
                const shortened = v.substring(0, 100) + "..."
                return new ClickableToggle(v, shortened)
                    .ToggleOnClick()
                    .SetClass("literal-code button")
            }
            return new FixedUiElement(v).SetClass("literal-code")
        }
        return s
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
    static T(
        t:
            | string
            | Record<string, string>
            | undefined
            | null
            | Translation
            | TypedTranslation<object>,
        context = undefined
    ): TypedTranslation<object> {
        if (t === undefined || t === null) {
            return undefined
        }
        if (typeof t === "number") {
            t = "" + t
        }
        if (typeof t === "string") {
            return new TypedTranslation<object>({ "*": t }, context)
        }
        if (t["render"] !== undefined) {
            const msg =
                "Creating a translation, but this object contains a 'render'-field. Use the translation directly"
            console.error(msg, t)
            throw msg
        }
        if (t instanceof TypedTranslation) {
            return t
        }
        if (t instanceof Translation) {
            return new TypedTranslation<object>(t.translations)
        }
        return new TypedTranslation<object>(t, context)
    }

    public static CountTranslations() {
        const queue: any = [Translations.t]
        const tr: Translation[] = []
        while (queue.length > 0) {
            const item = queue.pop()
            if (item instanceof Translation || item.translations !== undefined) {
                tr.push(item)
            } else if (typeof item === "string") {
                console.warn("Got single string in translationgs file: ", item)
            } else {
                for (const t in item) {
                    const x = item[t]
                    queue.push(x)
                }
            }
        }

        const langaugeCounts = {}
        for (const translation of tr) {
            for (const language in translation.translations) {
                if (langaugeCounts[language] === undefined) {
                    langaugeCounts[language] = 1
                } else {
                    langaugeCounts[language]++
                }
            }
        }
        for (const language in langaugeCounts) {
            console.log(
                "Total translations in ",
                language,
                langaugeCounts[language],
                "/",
                tr.length
            )
        }
    }

    public static DynamicSubstitute<T extends Record<string, string | Translation>>(
        translation: TypedTranslation<T>,
        t: Store<T>
    ): Store<string> {
        return Locale.language.map(
            (lang) => {
                const tags: Record<string, string> = {}
                for (const k in t.data) {
                    let v = t.data[k]
                    if (!v) {
                        continue
                    }
                    if (v["textFor"] !== undefined) {
                        v = v["textFor"](lang)
                    }
                    tags[k] = <string>v
                }
                return Utils.SubstituteKeys(translation.textFor(lang), t.data)
            },
            [t]
        )
    }

    static isProbablyATranslation(transl: any) {
        if (!transl || typeof transl !== "object") {
            return false
        }
        if (Object.keys(transl).length == 0) {
            // No translations found; not a translation
            return false
        }
        // is a weird key found?
        if (
            Object.keys(transl).some((key) => key !== "_context" && !this.knownLanguages.has(key))
        ) {
            return false
        }

        return true
    }
}
