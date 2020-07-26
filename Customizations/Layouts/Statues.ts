import {Layout} from "../Layout";
import {Artwork} from "../Layers/Artwork";

export class Statues extends Layout{
    constructor() {
        super(    "statues",
            ["en"],
            "Open Artwork Map",
            [new Artwork()],
            10,
            50.8435,
            4.3688,


            "        <h3>Open Statue Map</h3>\n" +
            "\n" +
            "<p>" +
            "Help with creating a map of all statues all over the world!"

            ,
            "  <p>Start by <a href=\"https://www.openstreetmap.org/user/new\" target=\"_blank\">creating an account\n" +
            "            </a> or by " +
            "            <span onclick=\"authOsm()\" class=\"activate-osm-authentication\">logging in</span>.</p>",
            "Start by clicking a pin and answering the questions");
    }
    
}