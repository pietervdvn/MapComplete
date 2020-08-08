import {Tag} from "../../../Logic/TagsFilter";
import Translations from "../../../UI/i18n/Translations";
import {TagRenderingOptions} from "../../TagRenderingOptions";


export default class BikeStationStand extends TagRenderingOptions {
    constructor() {
        const to = Translations.t.cyclofix.station.stand;
        super({
            priority: 10,
            question: to.question,
            mappings: [
                {k: new Tag("service:bicycle:stand", "yes"), txt: to.yes},
                {k: new Tag("service:bicycle:stand", "no"), txt: to.no},
            ]
        });
    }
}
