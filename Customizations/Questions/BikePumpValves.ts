import {TagRenderingOptions} from "../TagRendering";
import {Tag} from "../../Logic/TagsFilter";

export class BikePumpValves extends TagRenderingOptions{
    constructor() {
        super({
            question: "What valves are supported?",
            mappings: [
                {
                    k: new Tag("valves", " sclaverand;schrader;dunlop"),
                    txt: "There is a default head, so Presta, Dunlop and Auto"
                },
                {k: new Tag("valves", "dunlop"), txt: "Only dunlop"},
                {k: new Tag("valves", "sclaverand"), txt: "Only Sclaverand (also known as Dunlop)"},
                {k: new Tag("valves", "auto"), txt: "Only auto"},
            ],
            freeform: {
                key: "valves",
                template: "Supported valves are $$$",
                renderTemplate: "Supported valves are {valves}"
            }
        });
    }
}