import {Layout} from "../Layout";
import * as Layer from "../Layers/Bookcases";

export class Bookcases extends Layout{
    constructor() {
        super(    "bookcases",
            ["nl"],
            "Open Bookcase Map",
            [new Layer.Bookcases()],
            14,
            51.2,
            3.2,


            "        <h3>Open BoekenkastjesKaart</h3>\n" +
            "\n" +
            "<p>" +
            "Help mee met het creëeren van een volledige kaart met alle boekenruilkastjes!" +
            "Een boekenruilkastje is een vaste plaats in publieke ruimte waar iedereen een boek in kan zetten of uit kan meenemen." +
            "Meestal een klein kastje of doosje dat op straat staat, maar ook een oude telefooncellen of een schap in een station valt hieronder."+
            "</p>"
            ,
            "  <p>Begin met <a href=\"https://www.openstreetmap.org/user/new\" target=\"_blank\">het aanmaken van een account\n" +
            "            </a> of door je " +
            "            <span onclick=\"authOsm()\" class=\"activate-osm-authentication\">aan te melden</span>.</p>",
            "Klik op een boekenruilkastje om vragen te beantwoorden");
        this.locationContains= ["Bookcases.html", "Bookcase.html","bookcase"]
    }
}