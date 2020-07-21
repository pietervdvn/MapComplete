import {Layout} from "../Layout";
import * as Layer from "../Layers/Bookcases";
import {Widths} from "../Layers/Widths";
import {UIEventSource} from "../../UI/UIEventSource";

export class StreetWidth extends Layout{
    
    constructor() {
        super(    "width",
            ["nl"],
            "Straatbreedtes in Brugge",
            [new Widths(
                2,
               1.5,
                0.75
                
            )],
            15,
            51.20875,
            3.22435,
            "<h3>De straat is opgebruikt</h3>" +
            "<p>Er is steeds meer druk op de openbare ruimte. Voetgangers, fietsers, steps, auto's, bussen, bestelwagens, buggies, cargobikes, ... willen allemaal hun deel van de openbare ruimte.</p>" +
            "" +
            "<p>In deze studie nemen we Brugge onder de loep en kijken we hoe breed elke straat is én hoe breed elke straat zou moeten zijn voor een veilig én vlot verkeer.</p>" +
            "Verschillende ingrepen kunnen de stad teruggeven aan de inwoners en de stad leefbaarder en levendiger maken.<br/>" +
            "Denk aan:" +
            "<ul>" +
            "<li>De autovrije zone's uitbreiden</li>" +
            "<li>De binnenstad fietszone maken</li>" +
            "<li>Het aantal woonerven uitbreiden</li>" +
            "<li>Grotere auto's meer belasten - ze nemen immers meer parkeerruimte in.</li>" +
            "</ul>",
            "",
            "");
    }
}