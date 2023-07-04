// SPDX-FileCopyrightText: 2023 MapComplete  <https://mapcomplete.osm.be/>
//
// SPDX-License-Identifier: GPL-3.0-ONLY

export default class WikidataUtils {
    /**
     * Mapping from wikidata-codes to weblate-codes. The wikidata-code is the key, mapcomplete/weblate is the value
     */
    public static readonly languageRemapping = {
        nb: "nb_NO",
        "zh-hant": "zh_Hant",
        "zh-hans": "zh_Hans",
        "pt-br": "pt_BR",
    }

    /**
     * Extract languages and their language in every language from the data source.
     * The returned mapping will be {languageCode --> {languageCode0 --> language as written in languageCode0  }  }
     * @param data
     * @param remapLanguages
     */
    public static extractLanguageData(
        data: {
            lang: { value: string }
            code: { value: string }
            label: { value: string }
            directionalityLabel?: { value?: string }
        }[],
        remapLanguages: Record<string, string>
    ): Map<string, { translations: Map<string, string>; directionality?: string[] }> {
        console.log("Got " + data.length + " entries")
        const perId = new Map<
            string,
            { translations: Map<string, string>; directionality?: string[] }
        >()
        for (const element of data) {
            let id = element.code.value
            id = remapLanguages[id] ?? id
            let labelLang = element.label["xml:lang"]
            labelLang = remapLanguages[labelLang] ?? labelLang
            const value = element.label.value
            if (!perId.has(id)) {
                perId.set(id, { translations: new Map<string, string>(), directionality: [] })
            }
            const entry = perId.get(id)
            entry.translations.set(labelLang, value)
            const dir = element.directionalityLabel?.value
            if (dir) {
                if (entry.directionality.indexOf(dir) < 0) {
                    entry.directionality.push(dir)
                }
            }
        }

        console.log("Got " + perId.size + " languages")
        return perId
    }
}
