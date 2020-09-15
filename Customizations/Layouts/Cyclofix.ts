import {Layout} from "../Layout";
import BikeShops from "../Layers/BikeShops";
import Translations from "../../UI/i18n/Translations";
import Combine from "../../UI/Base/Combine";
import BikeOtherShops from "../Layers/BikeOtherShops";


export default class Cyclofix extends Layout {

    private static RememberTheDead(): boolean {
        const now = new Date();
        const m = now.getMonth() + 1;
        const day = new Date().getDay() + 1;
        const date = day + "/" + m;
        return (date === "31/10" || date === "1/11" || date === "2/11");
    }

    constructor() {
        super(
            "cyclofix",
            ["en", "nl", "fr", "gl","de"],
            Translations.t.cyclofix.title,
            ["bike_repair_station", "bike_cafes", new BikeShops(), "drinking_water", "bike_parking", new BikeOtherShops(),"bike_themed_object",
                // The first of november, halloween and the second of november, we remember our dead
                ...(Cyclofix.RememberTheDead() ? ["ghost_bike"] : [])],
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
        this.widenFactor = 0.05;
    }
}
