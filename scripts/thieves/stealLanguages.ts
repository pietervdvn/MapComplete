/*
 * Uses the languages in and to every translation from wikidata to generate a language question in wikidata/wikidata
 * */

import WikidataUtils from "../../Utils/WikidataUtils"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { LayerConfigJson } from "../../Models/ThemeConfig/Json/LayerConfigJson"
import { MappingConfigJson } from "../../Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson"
import LanguageUtils from "../../Utils/LanguageUtils"
import * as perCountry from "../../assets/language_in_country.json"
import { Utils } from "../../Utils"
function main() {
    const sourcepath = "assets/generated/languages-wd.json"
    console.log(`Converting language data file '${sourcepath}' into a tagMapping`)
    const languages = WikidataUtils.extractLanguageData(
        JSON.parse(readFileSync(sourcepath, "utf8")),
        {}
    )
    const mappings: MappingConfigJson[] = []
    const schoolmappings: MappingConfigJson[] = []

    const countryToLanguage: Record<string, string[]> = perCountry
    const officialLanguagesPerCountry = Utils.TransposeMap(countryToLanguage)

    languages.forEach((l, code) => {
        const then: Record<string, string> = {}
        l.forEach((tr, lng) => {
            const languageCodeWeblate = WikidataUtils.languageRemapping[lng] ?? lng
            if (!LanguageUtils.usedLanguages.has(languageCodeWeblate)) {
                return
            }
            then[languageCodeWeblate] = tr
        })

        const officialCountries = Utils.Dedup(
            officialLanguagesPerCountry[code]?.map((s) => s.toLowerCase()) ?? []
        )
        const prioritySearch =
            officialCountries.length > 0
                ? "_country~" + officialCountries.map((c) => "((^|;)" + c + "($|;))").join("|")
                : undefined
        mappings.push(<MappingConfigJson>{
            if: "language:" + code + "=yes",
            ifnot: "language:" + code + "=",
            searchTerms: {
                "*": [code],
            },
            then,
            priorityIf: prioritySearch,
        })

        schoolmappings.push(<MappingConfigJson>{
            if: "school:language=" + code,
            then,
            priorityIf: prioritySearch,
            searchTerms: {
                "*": [code],
            },
        })
    })

    const wikidataLayer = <LayerConfigJson>{
        id: "wikidata",
        description: {
            en: "Various tagrenderings which are generated from Wikidata. Automatically generated with a script, don't edit manually",
        },
        "#dont-translate": "*",
        source: {
            osmTags: "id~*",
        },
        title: null,
        mapRendering: null,
        tagRenderings: [
            {
                id: "language",
                // @ts-ignore
                description: "Enables to pick *a single* 'language:<lng>=yes' within the mappings",
                mappings,
            },
            {
                builtin: "wikidata.language",
                override: {
                    id: "language-multi",
                    // @ts-ignore
                    description:
                        "Enables to pick *multiple* 'language:<lng>=yes' within the mappings",
                    multiAnswer: true,
                },
            },
            {
                id: "school-language",
                // @ts-ignore
                description: "Enables to pick a single 'school:language=<lng>' within the mappings",
                multiAnswer: true,
                mappings: schoolmappings,
            },
        ],
    }
    const dir = "./assets/layers/wikidata/"
    if (!existsSync(dir)) {
        mkdirSync(dir)
    }
    const path = dir + "wikidata.json"
    writeFileSync(path, JSON.stringify(wikidataLayer, null, "  "))
    console.log("Written " + path)
}

main()
