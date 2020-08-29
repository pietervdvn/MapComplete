import {Tag} from "../../../Logic/Tags";
import Translations from "../../../UI/i18n/Translations";
import {TagRenderingOptions} from "../../TagRenderingOptions";


export default class ShopDiy extends TagRenderingOptions {
    constructor() {
        const key = 'service:bicycle:diy'
        const to = Translations.t.cyclofix.shop.diy
        super({
            question: to.question,
            mappings: [
                {k: new Tag(key, "yes"), txt: to.yes},
                {k: new Tag(key, "no"), txt: to.no},
            ]
        });
    }
}
