import { Layout } from "../Layout";
import { DrinkingWaterLayer } from "../Layers/DrinkingWater";
import { NatureReserves } from "../Layers/NatureReserves";
import { Park } from "../Layers/Park";
import { BikeParkings } from "../Layers/BikeParkings";

export class WalkByBrussels extends Layout {
    constructor() {
        super("walkbybrussels",
            "Drinking Water Spots",
            [new DrinkingWaterLayer(), new BikeParkings(), new Park(), new NatureReserves()],
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