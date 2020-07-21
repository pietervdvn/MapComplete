import {TagRenderingOptions} from "../../TagRendering";
import {Tag} from "../../../Logic/TagsFilter";
import Translations from "../../../UI/i18n/Translations";


export default class StationChain extends TagRenderingOptions {
    constructor() {
        const to = Translations.t.cyclofix.station.chain
        super({
            priority: 5,
            question: to.question,
            mappings: [
                {k: new Tag("service:bicycle:chain_tool", "yes"), txt: to.yes},
                {k: new Tag("service:bicycle:chain_tool", "no"), txt: to.no},
            ]
        });
    }
}
