import {TagRenderingOptions} from "../TagRendering";
import {UIEventSource} from "../../UI/UIEventSource";
import {Changes} from "../../Logic/Changes";
import {Tag} from "../../Logic/TagsFilter";


export class OperatorTag extends TagRenderingOptions {


    private static options = {
        priority: 5,
        question: "Wie beheert dit gebied?",
        freeform: {
            key: "operator",
            template: "Dit gebied wordt beheerd door $$$",
            renderTemplate: "Dit gebied wordt beheerd door {operator}",
            placeholder: "organisatie"
        },
        mappings: [
            {k: new Tag("operator", "Natuurpunt"), txt: "Natuurpunt"},
            {k: new Tag("operator", "Agentschap Natuur en Bos"), txt: "het Agentschap Natuur en Bos (ANB)"},
            {k: new Tag("operator", "private"), txt: "Beheer door een privépersoon"}
        ]
    }

    constructor() {
        super(OperatorTag.options);
    }

}