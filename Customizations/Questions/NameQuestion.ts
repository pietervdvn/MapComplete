/**
 * There are two ways to ask for names:
 * One is a big 'name-question', the other is the 'edit name' in the title.
 * THis one is the big question
 */
import {Tag} from "../../Logic/TagsFilter";
import {TagRenderingOptions} from "../TagRenderingOptions";

export class NameQuestion extends TagRenderingOptions{
    
    static options =  {
        priority: 10, // Move this last on the priority list, in order to prevent ppl to enter access restrictions and descriptions
        question: "Wat is de <i>officiële</i> naam van dit gebied?<br><span class='question-subtext'>" +
            "Zelf een naam bedenken wordt afgeraden.<br/>" +
            "Een beschrijving van het gebied geven kan in een volgende stap.<br/>" +
            "</span>",
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