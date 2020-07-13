import {TagRenderingOptions} from "../TagRendering";
import {Tag} from "../../Logic/TagsFilter";


export default class PumpManual extends TagRenderingOptions {
    private static options = {
        priority: 5,
        question: "Is the pump at this bike station manual or automatic (compressed air)?",
        mappings: [
            {k: new Tag("manual", "yes"), txt: "Manual"},
            {k: new Tag("manual", "no"), txt: "Automatic (with compressed air)"}
        ]
    }

    constructor() {
        super(PumpManual.options);
    }
}
