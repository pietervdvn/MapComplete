import {TagRenderingOptions} from "../../TagRendering";
import {Tag} from "../../../Logic/TagsFilter";
import Translations from "../../../UI/i18n/Translations";


export default class ShopRetail extends TagRenderingOptions {
    constructor() {
        const key = 'service:bicycle:retail'
        const to = Translations.t.cyclofix.shop.retail
        super({
            priority: 5,
            question: to.question,
            mappings: [
                {k: new Tag(key, "yes"), txt: to.yes},
                {k: new Tag(key, "no"), txt: to.no},
            ]
        });
    }
}
