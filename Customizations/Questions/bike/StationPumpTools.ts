import {TagRenderingOptions} from "../../TagRendering";
import {Tag, And} from "../../../Logic/TagsFilter";


export default class BikeStationPumpTools extends TagRenderingOptions {
    constructor() {
        super({
            priority: 15,
            question: "Which services are available at this bike station?",
            mappings: [
                {k: new And([new Tag("service:bicycle:tools", "no"), new Tag("service:bicycle:pump", "yes")]), txt: "There is only a pump available."},
                {k: new And([new Tag("service:bicycle:tools", "yes"), new Tag("service:bicycle:pump", "no")]), txt: "There are only tools (screwdrivers, pliers...) available."},
                {k: new And([new Tag("service:bicycle:tools", "yes"), new Tag("service:bicycle:pump", "yes")]), txt: "There are both tools and a pump available."}
            ]
        });
    }
}
