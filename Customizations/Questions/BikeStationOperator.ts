import {TagRenderingOptions} from "../TagRendering";
import {Tag} from "../../Logic/TagsFilter";

export default class BikeStationOperator extends TagRenderingOptions {
    private static options = {
        priority: 15,
        question: "Who operates this bike station (name of university, shop, city...)?",
        freeform: {
            key: "operator",
            template: "This bike station is operated by $$$",
            renderTemplate: "This bike station is operated by {operator}",
            placeholder: "organisatie"
        },
        mappings: [
            {k: new Tag("operator", "KU Leuven"), txt: "KU Leuven"},
            {k: new Tag("operator", "Stad Halle"), txt: "Stad Halle"},
            {k: new Tag("operator", "Saint Gilles - Sint Gillis"), txt: "Saint Gilles - Sint Gillis"},
            {k: new Tag("operator", "Jette"), txt: "Jette"},
            {k: new Tag("operator", "private"), txt: "Beheer door een privépersoon"}
        ]
    }

    constructor() {
        super(BikeStationOperator.options);
    }
}
