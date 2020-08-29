import {Tag} from "../../../Logic/Tags";
import Translations from "../../../UI/i18n/Translations";
import {TagRenderingOptions} from "../../TagRenderingOptions";


export default class 
PumpValves extends TagRenderingOptions{
    constructor() {
        const to = Translations.t.cyclofix.station.valves
        super({
            question: to.question,
            mappings: [
                {
                    k: new Tag("valves", "sclaverand;schrader;dunlop"),
                    txt: to.default
                },
                {k: new Tag("valves", "dunlop"), txt: to.dunlop},
                {k: new Tag("valves", "sclaverand"), txt: to.sclaverand},
                {k: new Tag("valves", "auto"), txt: to.auto},
            ],
            freeform: {
                extraTags: new Tag("fixme", "Freeform valves= tag used: possibly a wrong value"),
                key: "valves",
                template: to.template,
                renderTemplate: to.render
            }
        });
    }
}
