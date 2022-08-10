import * as used_languages from "../assets/generated/used_languages.json"

export default class LanguageUtils {

    /**
     * All the languages there is currently language support for in MapComplete
     */
    public static readonly usedLanguages : Set<string> = new Set(used_languages.languages)
}

