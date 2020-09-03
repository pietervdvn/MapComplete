import {Layout} from "../Layout";
import {InformationBoard} from "../Layers/InformationBoard";
import {NatureReserves} from "../Layers/NatureReserves";

export class Natuurpunt extends Layout{
    constructor() {
        super(
            "natuurpunt",
            ["nl"],
            "De natuur in",
            ["birdhides", new InformationBoard(), new NatureReserves(true), "drinking_water"],
            12,
            51.20875,
            3.22435,
            "<h3>Natuurstuff</h3>Geef meer gegevens over natuurgebieden en hun infoborden",
            "",
            ""
        );
        this.icon = "./assets/layers/bird_hide/birdhide.svg"
    }
}