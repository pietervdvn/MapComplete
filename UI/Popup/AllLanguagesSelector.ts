import { SearchablePillsSelector } from "../Input/SearchableMappingsSelector"
import { Store } from "../../Logic/UIEventSource"
import BaseUIElement from "../BaseUIElement"
import * as all_languages from "../../assets/language_translations.json"
import { Translation } from "../i18n/Translation"

export class AllLanguagesSelector extends SearchablePillsSelector<string> {
    constructor(options?: {
        mode?: "select-many" | "select-one"
        currentCountry?: Store<string>
        supportedLanguages?: Record<string, string> & { _meta?: { countries?: string[] } }
    }) {
        const possibleValues: {
            show: BaseUIElement
            value: string
            mainTerm: Record<string, string>
            searchTerms?: Record<string, string[]>
            hasPriority?: Store<boolean>
        }[] = []

        const langs = options?.supportedLanguages ?? all_languages["default"] ?? all_languages
        for (const ln in langs) {
            let languageInfo: Record<string, string> & { _meta?: { countries: string[] } } =
                all_languages[ln]
            const countries = languageInfo._meta?.countries?.map((c) => c.toLowerCase())
            languageInfo = { ...languageInfo }
            delete languageInfo._meta
            const term = {
                show: new Translation(languageInfo),
                value: ln,
                mainTerm: languageInfo,
                searchTerms: { "*": [ln] },
                hasPriority:
                    countries === undefined
                        ? undefined
                        : options?.currentCountry?.map(
                              (country) => countries?.indexOf(country.toLowerCase()) >= 0
                          ),
            }
            possibleValues.push(term)
        }
        super(possibleValues, {
            mode: options?.mode ?? "select-many",
        })
    }
}
