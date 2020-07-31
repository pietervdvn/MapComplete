import {UIElement} from "../../UI/UIElement";
import Translations from "../../UI/i18n/Translations";
import {TagRenderingOptions} from "../TagRenderingOptions";

export class EmailQuestion extends TagRenderingOptions {

    constructor(category: string | UIElement) {
        super({
            question: Translations.t.general.questions.emailOf.Subs({category: category}),
            freeform: {
                renderTemplate: Translations.t.general.questions.emailIs.Subs({category: category}),
                template: "$email$",
                key: "email"
            }
        });
    }

}