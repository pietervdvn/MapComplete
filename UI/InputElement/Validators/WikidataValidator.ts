import Combine from "../../Base/Combine"
import Title from "../../Base/Title"
import Table from "../../Base/Table"
import Wikidata from "../../../Logic/Web/Wikidata"
import { UIEventSource } from "../../../Logic/UIEventSource"
import Locale from "../../i18n/Locale"
import { Utils } from "../../../Utils"
import WikidataSearchBox from "../../Wikipedia/WikidataSearchBox"
import { Validator } from "../Validator"

export default class WikidataValidator extends Validator {
    constructor() {
        super(
            "wikidata",
            new Combine([
                "A wikidata identifier, e.g. Q42.",
                new Title("Helper arguments"),
                new Table(
                    ["name", "doc"],
                    [
                        ["key", "the value of this tag will initialize search (default: name)"],
                        [
                            "options",
                            new Combine([
                                "A JSON-object of type `{ removePrefixes: string[], removePostfixes: string[] }`.",
                                new Table(
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
                                    ]
                                ),
                            ]),
                        ],
                    ]
                ),
                new Title("Example usage"),
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
`,
            ])
        )
    }

    public isValid(str): boolean {
        if (str === undefined) {
            return false
        }
        if (str.length <= 2) {
            return false
        }
        return !str.split(";").some((str) => Wikidata.ExtractKey(str) === undefined)
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

    public inputHelper(currentValue, inputHelperOptions) {
        const args = inputHelperOptions.args ?? []
        const searchKey = args[0] ?? "name"

        const searchFor = <string>(
            (inputHelperOptions.feature?.properties[searchKey]?.toLowerCase() ?? "")
        )

        let searchForValue: UIEventSource<string> = new UIEventSource(searchFor)
        const options: any = args[1]
        if (searchFor !== undefined && options !== undefined) {
            const prefixes = <string[] | Record<string, string[]>>options["removePrefixes"] ?? []
            const postfixes = <string[] | Record<string, string[]>>options["removePostfixes"] ?? []
            const defaultValueCandidate = Locale.language.map((lg) => {
                const prefixesUnrwapped: RegExp[] = (
                    Array.isArray(prefixes) ? prefixes : prefixes[lg] ?? []
                ).map((s) => new RegExp("^" + s, "i"))
                const postfixesUnwrapped: RegExp[] = (
                    Array.isArray(postfixes) ? postfixes : postfixes[lg] ?? []
                ).map((s) => new RegExp(s + "$", "i"))
                let clipped = searchFor

                for (const postfix of postfixesUnwrapped) {
                    const match = searchFor.match(postfix)
                    if (match !== null) {
                        clipped = searchFor.substring(0, searchFor.length - match[0].length)
                        break
                    }
                }

                for (const prefix of prefixesUnrwapped) {
                    const match = searchFor.match(prefix)
                    if (match !== null) {
                        clipped = searchFor.substring(match[0].length)
                        break
                    }
                }
                return clipped
            })

            defaultValueCandidate.addCallbackAndRun((clipped) => searchForValue.setData(clipped))
        }

        let instanceOf: number[] = Utils.NoNull(
            (options?.instanceOf ?? []).map((i) => Wikidata.QIdToNumber(i))
        )
        let notInstanceOf: number[] = Utils.NoNull(
            (options?.notInstanceOf ?? []).map((i) => Wikidata.QIdToNumber(i))
        )

        return new WikidataSearchBox({
            value: currentValue,
            searchText: searchForValue,
            instanceOf,
            notInstanceOf,
        })
    }
}
