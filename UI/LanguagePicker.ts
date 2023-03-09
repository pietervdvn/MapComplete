import { DropDown } from "./Input/DropDown"
import Locale from "./i18n/Locale"
import BaseUIElement from "./BaseUIElement"
import native from "../assets/language_native.json"
import language_translations from "../assets/language_translations.json"
import { Translation } from "./i18n/Translation"
import Lazy from "./Base/Lazy"
import Toggle from "./Input/Toggle"
import LanguageUtils from "../Utils/LanguageUtils"

export default class LanguagePicker extends Toggle {
    constructor(languages: string[], label: string | BaseUIElement = "") {
        console.log("Constructing a language pîcker for languages", languages)
        if (languages === undefined || languages.length <= 1) {
            super(undefined, undefined, undefined)
        } else {
            const normalPicker = LanguagePicker.dropdownFor(languages, label)
            const fullPicker = new Lazy(() => LanguagePicker.dropdownFor(allLanguages, label))
            super(fullPicker, normalPicker, Locale.showLinkToWeblate)
            const allLanguages: string[] = LanguageUtils.usedLanguagesSorted
        }
    }

    private static dropdownFor(languages: string[], label: string | BaseUIElement): BaseUIElement {
        return new DropDown(
            label,
            languages
                .filter((lang) => lang !== "_context")
                .map((lang) => {
                    return { value: lang, shown: LanguagePicker.hybrid(lang) }
                }),
            Locale.language
        )
    }

    private static hybrid(lang: string): Translation {
        const nativeText = native[lang] ?? lang
        const translation = {}
        const trans = language_translations[lang]
        if (trans === undefined) {
            return new Translation({ "*": nativeText })
        }
        for (const key in trans) {
            if (key.startsWith("_")) {
                continue
            }
            const translationInKey = language_translations[lang][key]
            if (nativeText.toLowerCase() === translationInKey.toLowerCase()) {
                translation[key] = nativeText
            } else {
                translation[key] = nativeText + " (" + translationInKey + ")"
            }
        }
        return new Translation(translation)
    }
}
