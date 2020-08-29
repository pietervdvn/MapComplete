import { Tag } from "../../../Logic/Tags";
import Translations from "../../../UI/i18n/Translations";
import {TagRenderingOptions} from "../../TagRenderingOptions";


export default class ParkingAccessCargo extends TagRenderingOptions {
    constructor() {
        const key = "cargo_bike"
        const to = Translations.t.cyclofix.parking.access_cargo
        super({
            priority: 15,
            question: to.question.Render(),
            mappings: [
                {k: new Tag(key, "yes"), txt: to.yes},
                {k: new Tag(key, "designated"), txt: to.designated},
                {k: new Tag(key, "no"), txt: to.no}
            ]
        });
    }
}
