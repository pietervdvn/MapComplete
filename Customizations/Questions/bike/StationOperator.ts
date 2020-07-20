import {TagRenderingOptions} from "../../TagRendering";
import {Tag} from "../../../Logic/TagsFilter";
import Translations from "../../../UI/i18n/Translations";


export default class BikeStationOperator extends TagRenderingOptions {
    constructor() {
        const to = Translations.t.cyclofix.station.operator
        super({
            priority: 15,
            question: to.question,
            mappings: [
                {k: new Tag("operator", "KU Leuven"), txt: "KU Leuven"},
                {k: new Tag("operator", "Stad Halle"), txt: "Stad Halle"},
                {k: new Tag("operator", "Saint Gilles - Sint Gillis"), txt: "Saint Gilles - Sint Gillis"},
                {k: new Tag("operator", "Jette"), txt: "Jette"},
                {k: new Tag("operator", "private"), txt: to.private}
            ],
            freeform: {
                key: "operator",
                template: to.template.txt,
                renderTemplate: to.render.txt,
                placeholder: "organisatie"
            }
        });
    }
}
