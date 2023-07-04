// SPDX-FileCopyrightText: 2023 MapComplete  <https://mapcomplete.osm.be/>
//
// SPDX-License-Identifier: GPL-3.0-ONLY

import used_languages from "../assets/used_languages.json"

export default class LanguageUtils {
    /**
     * All the languages there is currently language support for in MapComplete
     */
    public static readonly usedLanguages: Set<string> = new Set(used_languages.languages)
    public static readonly usedLanguagesSorted: string[] = used_languages.languages
}
