import {Layout} from "../Layout";
import {Birdhide} from "../Layers/Birdhide";
import {InformationBoard} from "../Layers/InformationBoard";
import {NatureReserves} from "../Layers/NatureReserves";

export class Natuurpunt extends Layout{
    constructor() {
        super(
            "natuurpunt",
            ["nl"],
            "De natuur in",
            [new Birdhide(), new InformationBoard(), new NatureReserves(true)],
            12,
            51.20875,
            3.22435,
            "<h3>Natuurpuntstuff</h3>",
            "",
            ""
        );
    }
}