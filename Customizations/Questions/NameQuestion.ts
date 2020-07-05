/**
 * There are two ways to ask for names:
 * One is a big 'name-question', the other is the 'edit name' in the title.
 * THis one is the big question
 */
import {TagRenderingOptions} from "../TagRendering";
import {Tag} from "../../Logic/TagsFilter";

export class NameQuestion extends TagRenderingOptions{
    
    static options =  {
        priority: 20,
        question: "Wat is de <i>officiële</i> naam van dit gebied?",
        freeform: {
            key: "name",
            template: "De naam is $$$",
            renderTemplate: "", // We don't actually render it, only ask
            placeholder: "",
            extraTags: new Tag("noname","")
        },
        mappings: [
            {k: new Tag("noname", "yes"), txt: "Dit gebied heeft geen naam"},
        ]
    }
    
    constructor() {
        super(NameQuestion.options);
    }
    
}