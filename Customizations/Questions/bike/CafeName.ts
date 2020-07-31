import Translations from "../../../UI/i18n/Translations";
import {TagRenderingOptions} from "../../TagRenderingOptions";


export default class CafeName extends TagRenderingOptions {
    constructor() {
        const to = Translations.t.cyclofix.cafe.qName
        super({
            question: to.question,
            freeform: {
                key: "name",
                renderTemplate: to.render,
                template: to.template
            }
        })
    }
}
