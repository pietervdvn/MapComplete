import {TagRenderingOptions} from "../../TagRendering";
import {Tag} from "../../../Logic/TagsFilter";
import Translations from "../../../UI/i18n/Translations";


export default class ShopPump extends TagRenderingOptions {
    constructor() {
        const key = 'service:bicycle:pump'
        const to = Translations.t.cyclofix.shop.pump
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
