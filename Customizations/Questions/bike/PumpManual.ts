import {TagRenderingOptions} from "../../TagRendering";
import {Tag} from "../../../Logic/TagsFilter";
import Translations from "../../../UI/i18n/Translations";


export default class PumpManual extends TagRenderingOptions {
    constructor() {
        const to = Translations.t.cyclofix.station.electric
        super({
            priority: 5,
            question: to.question,
            mappings: [
                {k: new Tag("manual", "yes"), txt: to.manual},
                {k: new Tag("manual", "no"), txt: to.electric}
            ]
        });
    }
}
