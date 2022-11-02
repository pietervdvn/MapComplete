import { DropDown } from "./Input/DropDown"
import Locale from "./i18n/Locale"
import BaseUIElement from "./BaseUIElement"
import * as native from "../assets/language_native.json"
import * as language_translations from "../assets/language_translations.json"
import { Translation } from "./i18n/Translation"
import * as used_languages from "../assets/generated/used_languages.json"
import Lazy from "./Base/Lazy"
import Toggle from "./Input/Toggle"

export default class LanguagePicker extends Toggle {
    constructor(languages: string[], label: string | BaseUIElement = "") {
        console.log("Constructing a language pîcker for languages", languages)
        if (languages === undefined || languages.length <= 1) {
            super(undefined, undefined, undefined)
        } else {
            const normalPicker = LanguagePicker.dropdownFor(languages, label)
            const fullPicker = new Lazy(() => LanguagePicker.dropdownFor(allLanguages, label))
            super(fullPicker, normalPicker, Locale.showLinkToWeblate)
            const allLanguages: string[] = used_languages.languages
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
        const allTranslations = language_translations["default"] ?? language_translations
        const translation = {}
        const trans = allTranslations[lang]
        if (trans === undefined) {
            return new Translation({ "*": nativeText })
        }
        for (const key in trans) {
            if (key.startsWith("_")) {
                continue
            }
            const translationInKey = allTranslations[lang][key]
            if (nativeText.toLowerCase() === translationInKey.toLowerCase()) {
                translation[key] = nativeText
            } else {
                translation[key] = nativeText + " (" + translationInKey + ")"
            }
        }
        return new Translation(translation)
    }
}
