import {TagRenderingOptions} from "../../TagRendering";
import {Tag, And} from "../../../Logic/TagsFilter";
import Translations from "../../../UI/i18n/Translations";


export default class BikeStationPumpTools extends TagRenderingOptions {
    constructor() {
        const to = Translations.t.cylofix.station.services
        super({
            priority: 15,
            question: to.question.Render(),
            mappings: [
                {k: new And([new Tag("service:bicycle:tools", "no"), new Tag("service:bicycle:pump", "yes")]), txt: to.pump.Render()},
                {k: new And([new Tag("service:bicycle:tools", "yes"), new Tag("service:bicycle:pump", "no")]), txt: to.tools.Render()},
                {k: new And([new Tag("service:bicycle:tools", "yes"), new Tag("service:bicycle:pump", "yes")]), txt: to.both.Render()}
            ]
        });
    }
}
