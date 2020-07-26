import {TagRenderingOptions} from "../TagRendering";
import {UIElement} from "../../UI/UIElement";
import Translations from "../../UI/i18n/Translations";

export class PhoneNumberQuestion extends TagRenderingOptions {

    constructor(category: string | UIElement) {
        super({
            question: Translations.t.general.questions.phoneNumberOf.Subs({category: category}),
            freeform: {
                renderTemplate: Translations.t.general.questions.phoneNumberIs.Subs({category: category}),
                template: "$phone$",
                key: "phone"
            }
        });
    }

}