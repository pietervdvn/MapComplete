import {TagRenderingOptions} from "../../TagRendering";
import {Tag} from "../../../Logic/TagsFilter";
import Translations from "../../../UI/i18n/Translations";


export default class ShopRepair extends TagRenderingOptions {
    constructor() {
        const key = 'service:bicycle:repair'
        const to = Translations.t.cyclofix.shop.repair
        super({
            priority: 5,
            question: to.question,
            mappings: [
                {k: new Tag(key, "yes"), txt: to.yes},
                {k: new Tag(key, "only_sold"), txt: to.sold},
                {k: new Tag(key, "brand"), txt: to.brand},
                {k: new Tag(key, "no"), txt: to.no},
            ]
        });
    }
}
