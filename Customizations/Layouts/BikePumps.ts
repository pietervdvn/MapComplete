import {Layout} from "../Layout";
import {GrbToFix} from "../Layers/GrbToFix";
import { BikePumps } from "../Layers/BikePumps";

export class BikePumpsLayout extends Layout {
    constructor() {
        super(
            "pomp",
            "Cyclofix",
            [new BikePumps()],
            15,
            51.2083,
            3.2279,


            "<h3>Open CycloFix</h3>\n" +
            "\n" +
            "Something something bikes"

            ,
            "", "");
    }
}