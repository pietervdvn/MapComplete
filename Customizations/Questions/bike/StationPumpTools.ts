import {Tag, And} from "../../../Logic/Tags";
import Translations from "../../../UI/i18n/Translations";
import {TagRenderingOptions} from "../../TagRenderingOptions";


export default class BikeStationPumpTools extends TagRenderingOptions {
    constructor() {
        const to = Translations.t.cyclofix.station.services
        super({
            priority: 15,
            question: to.question,
            mappings: [
                {k: new And([new Tag("service:bicycle:tools", "no"), new Tag("service:bicycle:pump", "yes")]), txt: to.pump},
                {k: new And([new Tag("service:bicycle:tools", "yes"), new Tag("service:bicycle:pump", "no")]), txt: to.tools},
                {k: new And([new Tag("service:bicycle:tools", "yes"), new Tag("service:bicycle:pump", "yes")]), txt: to.both}
            ]
        });
    }
}
