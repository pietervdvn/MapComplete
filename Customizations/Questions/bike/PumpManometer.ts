import {TagRenderingOptions} from "../../TagRendering";
import {Tag} from "../../../Logic/TagsFilter";
import Translations from "../../../UI/i18n/Translations";


export default class PumpManometer extends TagRenderingOptions {
    constructor() {
        const to = Translations.t.cylofix.station.manometer
        super({
            question: to.question.Render(),
            mappings: [
                {k: new Tag("manometer", "yes"), txt: to.yes.Render()},
                {k: new Tag("manometer", "no"), txt: to.no.Render()},
                {k: new Tag("manometer", "broken"), txt: to.broken.Render()}
            ]
        });   
    }
}
