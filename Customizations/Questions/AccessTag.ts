import {TagRenderingOptions} from "../TagRendering";
import {UIEventSource} from "../../UI/UIEventSource";
import {Changes} from "../../Logic/Changes";
import {And, Tag} from "../../Logic/TagsFilter";

export class AccessTag extends TagRenderingOptions {

    private static options = {
        priority: 20,
        question: "Is dit gebied toegankelijk?",
        freeform: {
            key: "access:description",
            template: "Iets anders: $$$",
            renderTemplate: "De toegankelijkheid van dit gebied is: {access:description}",
            placeholder: "Specifieer"
        },
        mappings: [
            {k: new And([new Tag("access", "yes"), new Tag("fee", "")]), txt: "Publiek toegankelijk"},
            {k: new And([new Tag("access", "no"), new Tag("fee", "")]), txt: "Niet toegankelijk"},
            {k: new And([new Tag("access", "private"), new Tag("fee", "")]), txt: "Niet toegankelijk, want privegebied"},
            {k: new And([new Tag("access", "permissive"), new Tag("fee", "")]), txt: "Toegankelijk, maar het is privegebied"},
            {k: new And([new Tag("access", "guided"), new Tag("fee", "")]), txt: "Enkel met gids of op activiteit"},
            {
                k: new And([new Tag("access", "yes"),
                    new Tag("fee", "yes")]),
                txt: "Toegankelijk mits betaling",
                priority: 10
            },
        ]
    }
    
    constructor() {
        super(AccessTag.options);
    }


}