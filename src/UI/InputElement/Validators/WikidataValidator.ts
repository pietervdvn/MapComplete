import Combine from "../../Base/Combine"
import Wikidata, { WikidataResponse } from "../../../Logic/Web/Wikidata"
import { Validator } from "../Validator"
import { Translation } from "../../i18n/Translation"
import Translations from "../../i18n/Translations"
import Title from "../../Base/Title"
import Table from "../../Base/Table"
import MarkdownUtils from "../../../Utils/MarkdownUtils"

export default class WikidataValidator extends Validator {
    public static readonly _searchCache = new Map<string, Promise<WikidataResponse[]>>()

    public static docs = [
        "### Helper arguments",
        MarkdownUtils.table(
            ["name", "doc"],
            [
                [
                    "key",
                    "the value of this tag will initialize search (default: name). This can be a ';'-separated list in which case every key will be inspected. The non-null value will be used as search",
                ],
                [
                    "options",
                    "A JSON-object of type `{ removePrefixes: Record<string, string[]>, removePostfixes: Record<string, string[]>, ... }`. See the more detailed explanation below",
                ],
            ]
        ),
        "#### Suboptions",
        MarkdownUtils.table(
            ["subarg", "doc"],
            [
                [
                    "removePrefixes",
                    "remove these snippets of text from the start of the passed string to search. This is either a list OR a hash of languages to a list. The individual strings are interpreted as case ignoring regexes",
                ],
                [
                    "removePostfixes",
                    "remove these snippets of text from the end of the passed string to search. This is either a list OR a hash of languages to a list. The individual strings are interpreted as case ignoring regexes.",
                ],
                [
                    "instanceOf",
                    "A list of Q-identifier which indicates that the search results _must_ be an entity of this type, e.g. [`Q5`](https://www.wikidata.org/wiki/Q5) for humans",
                ],
                [
                    "notInstanceof",
                    "A list of Q-identifiers which indicates that the search results _must not_ be an entity of this type, e.g. [`Q79007`](https://www.wikidata.org/wiki/Q79007) to filter away all streets from the search results",
                ],
                ["multiple", "If 'yes' or 'true', will allow to select multiple values at once"],
            ]
        ),
    ].join("\n\n")
    private static readonly docsExampleUsage: string =
        "### Example usage\n\n" +
        `The following is the 'freeform'-part of a layer config which will trigger a search for the wikidata item corresponding with the name of the selected feature. It will also remove '-street', '-square', ... if found at the end of the name

\`\`\`json
"freeform": {
    "key": "name:etymology:wikidata",
    "type": "wikidata",
    "helperArgs": [
        "name",
        {
            "removePostfixes": {"en": [
                "street",
                "boulevard",
                "path",
                "square",
                "plaza",
            ],
             "nl": ["straat","plein","pad","weg",laan"],
             "fr":["route (de|de la|de l'| de le)"]
             },

            "#": "Remove streets and parks from the search results:"
             "notInstanceOf": ["Q79007","Q22698"]
        }

    ]
}
\`\`\`

Another example is to search for species and trees:

\`\`\`json
 "freeform": {
        "key": "species:wikidata",
        "type": "wikidata",
        "helperArgs": [
          "species",
          {
          "instanceOf": [10884, 16521]
        }]
      }
\`\`\`
`

    constructor() {
        super(
            "wikidata",
            "A wikidata identifier, e.g. Q42.\n\n" +
                WikidataValidator.docs +
                WikidataValidator.docsExampleUsage
        )
    }

    public isValid(str): boolean {
        if (str === undefined) {
            return false
        }
        if (str.length == 1) {
            return false
        }
        return !str.split(";").some((str) => Wikidata.ExtractKey(str) === undefined)
    }

    getFeedback(s: string, _?: () => string): Translation | undefined {
        const t = Translations.t.validation.wikidata
        if (s === "") {
            return t.empty
        }
        if (!s.match(/(Q[0-9]+)(;Q[0-9]+)*/)) {
            return t.startsWithQ
        }
        return undefined
    }

    public reformat(str) {
        if (str === undefined) {
            return undefined
        }
        let out = str
            .split(";")
            .map((str) => Wikidata.ExtractKey(str))
            .join("; ")
        if (str.endsWith(";")) {
            out = out + ";"
        }
        return out
    }

    /**
     *
     * @param searchTerm
     * @param postfixesToRemove
     * @param prefixesToRemove
     * @param language
     *
     *
     * WikidataValidator.removePostAndPrefixes("Elf-Julistraat", [], ["straat", "laan"], "nl") // => "Elf-Juli"
     * WikidataValidator.removePostAndPrefixes("Elf-Julistraat", [], {"nl":["straat", "laan"], "en": ["street"]}, "nl") // => "Elf-Juli"
     * WikidataValidator.removePostAndPrefixes("Elf-Julistraat", [], {"nl":["straat", "laan"], "en": ["street"]}, "en") // => "Elf-Julistraat"
     */
    public static removePostAndPrefixes(
        searchTerm: string,
        prefixesToRemove: string[] | Record<string, string[]>,
        postfixesToRemove: string[] | Record<string, string[]>,
        language: string
    ): string {
        const prefixes = prefixesToRemove
        const postfixes = postfixesToRemove
        const prefixesUnwrapped: RegExp[] = (
            Array.isArray(prefixes) ? prefixes : prefixes[language] ?? []
        ).map((s) => new RegExp("^" + s, "i"))

        const postfixesUnwrapped: RegExp[] = (
            Array.isArray(postfixes) ? postfixes : postfixes[language] ?? []
        ).map((s) => new RegExp(s + "$", "i"))

        let clipped = searchTerm.trim()

        for (const postfix of postfixesUnwrapped) {
            const match = searchTerm.trim().match(postfix)
            if (match !== null) {
                clipped = searchTerm.trim().substring(0, searchTerm.trim().length - match[0].length)
                break
            }
        }

        for (const prefix of prefixesUnwrapped) {
            const match = searchTerm.trim().match(prefix)
            if (match !== null) {
                clipped = searchTerm.trim().substring(match[0].length)
                break
            }
        }
        return clipped
    }
}
