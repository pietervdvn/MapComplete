import Combine from "../../Base/Combine"
import Wikidata from "../../../Logic/Web/Wikidata"
import WikidataSearchBox from "../../Wikipedia/WikidataSearchBox"
import { Validator } from "../Validator"
import { Translation } from "../../i18n/Translation"
import Translations from "../../i18n/Translations"

export default class WikidataValidator extends Validator {
    constructor() {
        super("wikidata", new Combine(["A wikidata identifier, e.g. Q42.", WikidataSearchBox.docs]))
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
}
