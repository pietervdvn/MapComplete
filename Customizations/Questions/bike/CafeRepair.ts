import {Tag} from "../../../Logic/Tags";
import Translations from "../../../UI/i18n/Translations";
import {TagRenderingOptions} from "../../TagRenderingOptions";


export default class CafeRepair extends TagRenderingOptions {
    constructor() {
        const key = 'service:bicycle:repair'
        const to = Translations.t.cyclofix.cafe.repair
        super({
            question: to.question,
            mappings: [
                {k: new Tag(key, "yes"), txt: to.yes},
                {k: new Tag(key, "no"), txt: to.no}
            ]
        });
    }
}
