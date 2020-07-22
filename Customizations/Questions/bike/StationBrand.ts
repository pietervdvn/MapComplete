import {TagRenderingOptions} from "../../TagRendering";
import {Tag} from "../../../Logic/TagsFilter";


/**
 * Currently not used in Cyclofix because it's a little vague
 * 
 * TODO: Translations
 */
export default class BikeStationBrand extends TagRenderingOptions {
    private static options = {
        priority: 15,
        question: "What is the brand of this bike station (name of university, shop, city...)?",
        freeform: {
            key: "brand",
            template: "The brand of this bike station is $$$",
            renderTemplate: "The brand of this bike station is {operator}",
            placeholder: "brand"
        },
        mappings: [
            {k: new Tag("brand", "Velo Fix Station"), txt: "Velo Fix Station"}
        ]
    }

    constructor() {
        throw Error('BikeStationBrand disabled')
        super(BikeStationBrand.options);
    }
}
