import {TagRenderingOptions} from "../TagRendering";
import {Tag} from "../../Logic/TagsFilter";


export default class BikeStationStand extends TagRenderingOptions {
    private static options = {
        priority: 10,
        question: "Does this bike station have a hook to suspend your bike with or a stand to elevate it?",
        mappings: [
            {k: new Tag("service:bicycle:stand", "yes"), txt: "There is a hook or stand."},
            {k: new Tag("service:bicycle:stand", "no"), txt: "There is no hook or stand"},
        ]
    }

    constructor() {
        super(BikeStationStand.options);
    }
}
