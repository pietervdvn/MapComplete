import {Layout} from "../Layout";
import * as Layer from "../Layers/Bookcases";
import Translations from "../../UI/i18n/Translations";
import Combine from "../../UI/Base/Combine";

export class Bookcases extends Layout {
    constructor() {
        super("bookcases",
            ["nl", "en"],
            Translations.t.bookcases.title,
            [new Layer.Bookcases()],
            14,
            51.2,
            3.2,

            new Combine(["<h3>",Translations.t.bookcases.title,"</h3>", Translations.t.bookcases.description])
        );
        this.icon = "assets/bookcase.svg"
    }
}