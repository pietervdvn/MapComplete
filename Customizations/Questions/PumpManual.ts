import {TagRenderingOptions} from "../TagRendering";
import {UIEventSource} from "../../UI/UIEventSource";
import {Changes} from "../../Logic/Changes";
import {Tag} from "../../Logic/TagsFilter";


export class PumpManual extends TagRenderingOptions {


    private static options = {
        priority: 5,
        question: "Is dit een manuele pomp?",
        mappings: [
            {k: new Tag("manual", "yes"), txt: "Manuele pomp"},
            {k: new Tag("manual", "no"), txt: "Automatische pomp"}
        ]
    }

    constructor() {
        super(PumpManual.options);
    }

}