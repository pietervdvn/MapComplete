import {Layout} from "../Layout";
import BikeParkings from "../Layers/BikeParkings";
import BikeServices from "../Layers/BikeStations";
import BikeShops from "../Layers/BikeShops";
import {GhostBike} from "../Layers/GhostBike";
import Translations from "../../UI/i18n/Translations";
import {DrinkingWater} from "../Layers/DrinkingWater";
import {BikeShop} from "../Layers/BikeShop";


export default class Cyclofix extends Layout {
    constructor() {
        super(
            "pomp",
            Translations.t.cylofix.title,
            [/*new GhostBike(),*/ new BikeServices(), new BikeParkings(), new BikeShops(), new DrinkingWater()],
            16,
            50.8465573,
            4.3516970,
            "<h3>" + Translations.t.cylofix.title.Render() + "</h3>\n" +
            "\n" +
            `<p>${Translations.t.cylofix.description.Render()}</p>`
            ,
            "", "");
    }
}
