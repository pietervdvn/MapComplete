import {Tag} from "../../../Logic/Tags";
import Translations from "../../../UI/i18n/Translations";
import {TagRenderingOptions} from "../../TagRenderingOptions";


export default class PumpOperational extends TagRenderingOptions {
    constructor() {
        const to = Translations.t.cyclofix.station.operational
        super({
            question: to.question,
            mappings: [
                {k: new Tag("service:bicycle:pump:operational_status","broken"), txt: to.broken},
                {k: new Tag("service:bicycle:pump:operational_status",""), txt: to.operational}
            ]
        });
    }
}
