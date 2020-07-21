import {TagRenderingOptions} from "../../TagRendering";
import Translations from "../../../UI/i18n/Translations";


export default class ShopPump extends TagRenderingOptions {
    constructor() {
        const to = Translations.t.cylofix.shop.qName
        super({
            priority: 5,
            question: to.question.Render(),
            freeform: {
                key: "name",
                renderTemplate: to.render.txt,
                template: to.template.txt
            }
        })
    }
}
