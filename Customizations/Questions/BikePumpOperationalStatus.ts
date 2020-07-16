import {TagDependantUIElement} from "../UIElementConstructor";
import {TagRenderingOptions} from "../TagRendering";
import {Tag} from "../../Logic/TagsFilter";

export class BikePumpOperationalStatus extends TagRenderingOptions{
    constructor() {
        super({
            question: "Is the bicycle pump still operational?",
            mappings: [
                {k: new Tag("service:bicycle:pump:operational_status","broken"), txt: "This pump is broken"},
                {k: new Tag("service:bicycle:pump:operational_status",""), txt: "This pump is operational"}
            ]
        });
    }
}