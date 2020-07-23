import {Layout} from "../Layout";
import BikeParkings from "../Layers/BikeParkings";
import BikeServices from "../Layers/BikeStations";
import BikeShops from "../Layers/BikeShops";
import Translations from "../../UI/i18n/Translations";
import {DrinkingWater} from "../Layers/DrinkingWater";
import Combine from "../../UI/Base/Combine";


export default class Cyclofix extends Layout {
    constructor() {
        super(
            "pomp",
            ["en", "nl", "fr"],
            Translations.t.cyclofix.title,
            [new BikeServices(), new BikeShops(), new DrinkingWater(), new BikeParkings()],
            16,
            50.8465573,
            4.3516970,
            new Combine([
                "<h3>",
                Translations.t.cyclofix.title,
                "</h3><br/><p>",
                Translations.t.cyclofix.description,
                "</p>"
            ])
        );
    }
}
