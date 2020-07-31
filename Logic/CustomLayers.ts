import {Layout} from "../Customizations/Layout";
import Translations from "../UI/i18n/Translations";

export class CustomLayers extends Layout {

    public static NAME: string = "personal";

    constructor() {
        super(
            CustomLayers.NAME,
            ["en"],
            Translations.t.favourite.title,
            [],
            12,
            0,
            0,
            Translations.t.favourite.description,
        );

        this.icon = "./assets/star.svg"
    }

}


    