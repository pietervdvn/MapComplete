import {TagRenderingOptions} from "../../TagRendering";
import Translations from "../../../UI/i18n/Translations";


export default class ShopPump extends TagRenderingOptions {
    constructor() {
        const to = Translations.t.cyclofix.shop.qName
        super({
            priority: 5,
            question: to.question,
            freeform: {
                key: "name",
                renderTemplate: to.render,
                template: to.template
            }
        })
    }
}
