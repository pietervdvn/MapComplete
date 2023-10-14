import { DropDown } from "./Input/DropDown"
import Locale from "./i18n/Locale"
import BaseUIElement from "./BaseUIElement"
import native from "../assets/language_native.json"
import language_translations from "../assets/language_translations.json"
import { Translation } from "./i18n/Translation"
import Lazy from "./Base/Lazy"
import Toggle from "./Input/Toggle"
import LanguageUtils from "../Utils/LanguageUtils"
import { UIEventSource } from "../Logic/UIEventSource"
import { QueryParameters } from "../Logic/Web/QueryParameters"

export default class LanguagePicker extends Toggle {
    constructor(languages: string[], assignTo: UIEventSource<string>) {
        console.log("Constructing a language picker for languages", languages)
        if (
            languages === undefined ||
            languages.length <= 1 ||
            QueryParameters.wasInitialized("language")
        ) {
            super(undefined, undefined, undefined)
        } else {
            const normalPicker = LanguagePicker.dropdownFor(languages, assignTo ?? Locale.language)
            const fullPicker = new Lazy(() =>
                LanguagePicker.dropdownFor(allLanguages, assignTo ?? Locale.language)
            )
            super(fullPicker, normalPicker, Locale.showLinkToWeblate)
            const allLanguages: string[] = LanguageUtils.usedLanguagesSorted
        }
    }

    private static dropdownFor(
        languages: string[],
        assignTo: UIEventSource<string>
    ): BaseUIElement {
        return new DropDown(
            undefined,
            languages
                .filter((lang) => lang !== "_context")
                .map((lang) => {
                    return { value: lang, shown: LanguagePicker.hybrid(lang) }
                }),
            assignTo
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
