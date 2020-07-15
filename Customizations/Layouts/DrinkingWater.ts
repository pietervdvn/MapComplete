import { Layout } from "../Layout";
import { DrinkingWaterLayer } from "../Layers/DrinkingWater";

export class DrinkingWater extends Layout {
    constructor() {
        super("drinkingwater",
            "Drinking Water Spots",
            [new DrinkingWaterLayer()],
            10,
            50.8435,
            4.3688,


            "        <h3>Drinking water</h3>\n" +
            "\n" +
            "<p>" +
            "Help with creating a map of drinking water points!"

            ,
            "  <p>Start by <a href=\"https://www.openstreetmap.org/user/new\" target=\"_blank\">creating an account\n" +
            "            </a> or by " +
            "            <span onclick=\"authOsm()\" class=\"activate-osm-authentication\">logging in</span>.</p>",
            "Start by clicking a pin and answering the questions");
    }

}