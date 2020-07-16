import {TagRenderingOptions} from "../../TagRendering";
import {Tag} from "../../../Logic/TagsFilter";


export default class PumpManual extends TagRenderingOptions {
    constructor() {
        super({
            priority: 5,
            question: "Is this an electric bike pump?",
            mappings: [
                {k: new Tag("manual", "yes"), txt: "Manual pump"},
                {k: new Tag("manual", "no"), txt: "Electric pump"}
            ]
        });
    }
}
