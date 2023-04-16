import Combine from "../../Base/Combine"
import Wikidata from "../../../Logic/Web/Wikidata"
import { UIEventSource } from "../../../Logic/UIEventSource"
import Locale from "../../i18n/Locale"
import { Utils } from "../../../Utils"
import WikidataSearchBox from "../../Wikipedia/WikidataSearchBox"
import { Validator } from "../Validator"

export default class WikidataValidator extends Validator {
    constructor() {
        super("wikidata", new Combine(["A wikidata identifier, e.g. Q42.", WikidataSearchBox.docs]))
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
