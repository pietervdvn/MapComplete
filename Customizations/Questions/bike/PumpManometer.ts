import {Tag} from "../../../Logic/Tags";
import Translations from "../../../UI/i18n/Translations";
import {TagRenderingOptions} from "../../TagRenderingOptions";


export default class PumpManometer extends TagRenderingOptions {
    constructor() {
        const to = Translations.t.cyclofix.station.manometer
        super({
            question: to.question,
            mappings: [
                {k: new Tag("manometer", "yes"), txt: to.yes},
                {k: new Tag("manometer", "no"), txt: to.no},
                {k: new Tag("manometer", "broken"), txt: to.broken}
            ]
        });   
    }   
}
