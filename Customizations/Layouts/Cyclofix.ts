import {Layout} from "../Layout";
import BikeShops from "../Layers/BikeShops";
import Translations from "../../UI/i18n/Translations";
import Combine from "../../UI/Base/Combine";
import BikeOtherShops from "../Layers/BikeOtherShops";
import BikeCafes from "../Layers/BikeCafes";


export default class Cyclofix extends Layout {
    constructor() {
        super(
            "cyclofix",
            ["en", "nl", "fr","gl"],
            Translations.t.cyclofix.title,
            ["bike_repair_station", new BikeShops(), "drinking_water", "bike_parking", new BikeOtherShops(), new BikeCafes(),
                // The first of november, we remember our dead
                ...(new Date().getMonth() + 1 == 11 && new Date().getDay() + 1 == 1 ? ["ghost_bike"] : [])],
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
        this.icon = "./assets/bike/logo.svg"
        this.description = "Easily search and contribute bicycle data nearby";
        this.socialImage = "./assets/bike/cyclofix.jpeg";
        this.widenFactor = 0.5;
    }
}
