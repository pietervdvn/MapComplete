import {Layout} from "../Layout";
import BikeParkings from "../Layers/BikeParkings";
import BikeServices from "../Layers/BikeStations";
import BikeShops from "../Layers/BikeShops";
import {GhostBike} from "../Layers/GhostBike";
import Translations from "../../UI/i18n/Translations";
import {DrinkingWater} from "../Layers/DrinkingWater";
import {BikeShop} from "../Layers/BikeShop"
import Combine from "../../UI/Base/Combine";


export default class Cyclofix extends Layout {
    constructor() {
        super(
            "pomp",
            ["en", "nl", "fr"],
            Translations.t.cyclofix.title,
            [new BikeServices(), new BikeShop(), new DrinkingWater(), new BikeParkings()],
            16,
            50.8465573,
            4.3516970,
               /* Translations.t.cyclofix.title/*/
            new Combine([
                "<h3>",
                Translations.t.cyclofix.title,
                "</h3><br/><p>",
                Translations.t.cyclofix.description,
                "</p>"
            ])//*/
        );
    }
}
