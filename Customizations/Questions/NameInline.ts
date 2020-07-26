import {TagRenderingOptions} from "../TagRendering";
import {And, Tag} from "../../Logic/TagsFilter";
import {UIElement} from "../../UI/UIElement";
import Translations from "../../UI/i18n/Translations";


export class NameInline extends TagRenderingOptions{
    
    constructor(category: string | UIElement ) {
        super({
            question: "",

            freeform: {
                renderTemplate: "{name}",
                template: Translations.t.general.nameInlineQuestion.Subs({category: category}),
                key: "name",
                extraTags: new Tag("noname", "") // Remove 'noname=yes'
            },

            mappings: [
                {k: new Tag("noname","yes"), txt: Translations.t.general.noNameCategory.Subs({category: category})},
                {k: null, txt: category}
            ]
        });
    }
    
}