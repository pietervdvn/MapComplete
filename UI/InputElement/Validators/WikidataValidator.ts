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
}
