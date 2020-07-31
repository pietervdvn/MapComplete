import Translations from "../../../UI/i18n/Translations";
import {TagRenderingOptions} from "../../TagRenderingOptions";


export default class ParkingCapacity extends TagRenderingOptions {
    constructor() {
        const to = Translations.t.cyclofix.parking.capacity
        super({
            priority: 15,
            question: to.question,
            freeform: {
                key: "capacity",
                renderTemplate: to.render,
                template: to.template
            }
        });
    }
}
