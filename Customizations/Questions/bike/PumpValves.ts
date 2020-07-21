import {TagRenderingOptions} from "../../TagRendering";
import {Tag} from "../../../Logic/TagsFilter";
import Translations from "../../../UI/i18n/Translations";


export default class PumpValves extends TagRenderingOptions{
    constructor() {
        const to = Translations.t.cyclofix.station.valves
        super({
            question: to.question.Render(),
            mappings: [
                {
                    k: new Tag("valves", " sclaverand;schrader;dunlop"),
                    txt: to.default.Render()
                },
                {k: new Tag("valves", "dunlop"), txt: to.dunlop.Render()},
                {k: new Tag("valves", "sclaverand"), txt: to.sclaverand.Render()},
                {k: new Tag("valves", "auto"), txt: to.auto.Render()},
            ],
            freeform: {
                extraTags: new Tag("fixme", "Freeform valves= tag used: possibly a wrong value"),
                key: "valves",
                template: to.template.txt,
                renderTemplate: to.render.txt
            }
        });
    }
}
