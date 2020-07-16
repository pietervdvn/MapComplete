import {TagRenderingOptions} from "../../TagRendering";
import {Tag} from "../../../Logic/TagsFilter";


export default class PumpManometer extends TagRenderingOptions {
    constructor() {
        super({
            question: "Does the pump have a pressure indicator or manometer?",
            mappings: [
                {k: new Tag("manometer", "yes"), txt: "Yes, there is a manometer"},
                {k: new Tag("manometer","broken"), txt: "Yes, but it is broken"},
                {k: new Tag("manometer", "yes"), txt: "No"}
            ]
        });   
    }
}
