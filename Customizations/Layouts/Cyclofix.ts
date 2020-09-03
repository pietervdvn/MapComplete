import {Layout} from "../Layout";
import BikeServices from "../Layers/BikeStations";
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
            [new BikeServices(), new BikeShops(), "drinking_water", "bike_parking", new BikeOtherShops(), new BikeCafes()],
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
