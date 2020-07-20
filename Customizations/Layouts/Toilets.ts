import {Layout} from "../Layout";
import * as Layer from "../Layers/Toilets";

export class Toilets extends Layout{
    constructor() {
        super(      "toilets",
            ["en"],
            "Open Toilet Map",
            [new Layer.Toilets()],
            12,
            51.2,
            3.2,


            "        <h3>Open Toilet Map</h3>\n" +
            "\n" +
            "<p>Help us to create the most complete map about <i>all</i> the toilets in the world, based on openStreetMap." +
            "One can answer questions here, which help users all over the world to find an accessible toilet, close to them.</p>"
            ,
            "  <p>Start by <a href=\"https://www.openstreetmap.org/user/new\" target=\"_blank\">creating an account\n" +
            "            </a> or by " +
            "            <span onclick=\"authOsm()\" class=\"activate-osm-authentication\">logging in</span>.</p>",
            "Start by clicking a pin and answering the questions");
    }
}