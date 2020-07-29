import { TagRenderingOptions } from "../../TagRendering";
import { Tag } from "../../../Logic/TagsFilter";
import Translations from "../../../UI/i18n/Translations";


export default class ParkingCovered extends TagRenderingOptions {
    constructor() {
        const key = 'covered'
        const to = Translations.t.cyclofix.parking.covered
        super({
            priority: 15,
            question: to.question.Render(),
            mappings: [
                {k: new Tag(key, "yes"), txt: to.yes},
                {k: new Tag(key, "no"), txt: to.no}
            ]
        });
    }
}
