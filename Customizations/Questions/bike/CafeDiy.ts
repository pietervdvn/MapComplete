import {Tag} from "../../../Logic/TagsFilter";
import Translations from "../../../UI/i18n/Translations";
import {TagRenderingOptions} from "../../TagRenderingOptions";


export default class CafeDiy extends TagRenderingOptions {
    constructor() {
        const key = 'service:bicycle:diy'
        const to = Translations.t.cyclofix.cafe.diy
        super({
            question: to.question,
            mappings: [
                {k: new Tag(key, "yes"), txt: to.yes},
                {k: new Tag(key, "no"), txt: to.no},
            ]
        });
    }
}
