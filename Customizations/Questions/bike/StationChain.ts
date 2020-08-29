import {Tag} from "../../../Logic/Tags";
import Translations from "../../../UI/i18n/Translations";
import {TagRenderingOptions} from "../../TagRenderingOptions";


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
