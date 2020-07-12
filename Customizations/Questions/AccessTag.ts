import {TagRenderingOptions} from "../TagRendering";
import {UIEventSource} from "../../UI/UIEventSource";
import {Changes} from "../../Logic/Changes";
import {And, Tag} from "../../Logic/TagsFilter";

export class AccessTag extends TagRenderingOptions {

    private static options = {
        priority: 10,
        question: "Is dit gebied toegankelijk?",
        primer: "Dit gebied is ",
        freeform: {
            key: "access",
            extraTags: new Tag("fixme", "Freeform access tag used: possibly a wrong value"),
            template: "Iets anders: $$$",
            renderTemplate: "De toegangekelijkheid van dit gebied is: {access}",
            placeholder: "Specifieer"
        },
        mappings: [
            {k: new And([new Tag("access", "yes"), new Tag("fee", "")]), txt: "publiek toegankelijk"},
            {k: new And([new Tag("access", "no"), new Tag("fee", "")]), txt: "niet toegankelijk"},
            {k: new And([new Tag("access", "private"), new Tag("fee", "")]), txt: "niet toegankelijk, want privegebied"},
            {k: new And([new Tag("access", "permissive"), new Tag("fee", "")]), txt: "toegankelijk, maar het is privegebied"},
            {k: new And([new Tag("access", "guided"), new Tag("fee", "")]), txt: "enkel met gids of op activiteit"},
            {
                k: new And([new Tag("access", "yes"),
                    new Tag("fee", "yes")]),
                txt: "toegankelijk mits betaling",
                priority: 10
            },
        ]
    }
    
    constructor() {
        super(AccessTag.options);
    }


}