import {TagRenderingOptions} from "../TagRendering";
import {Tag} from "../../Logic/TagsFilter";


export default class BikeStationChain extends TagRenderingOptions {
    private static options = {
        priority: 5,
        question: "Does this bike station have a special tool to repair your bike chain?",
        mappings: [
            {k: new Tag("service:bicycle:chain_tool", "yes"), txt: "There is a chain tool."},
            {k: new Tag("service:bicycle:chain_tool", "no"), txt: "There is no chain tool."},
        ]
    }

    constructor() {
        super(BikeStationChain.options);
    }
}
