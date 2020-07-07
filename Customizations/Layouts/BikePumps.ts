import {Layout} from "../Layout";
import {GrbToFix} from "../Layers/GrbToFix";
import { BikePumps } from "../Layers/BikePumps";

export class BikePumpsLayout extends Layout {
    constructor() {
        super(
            "pomp",
            "Grb import fix tool",
            [new BikePumps()],
            15,
            51.2083,
            3.2279,


            "<h3>GRB Fix tool</h3>\n" +
            "\n" +
            "Expert use only"

            ,
            "", "");
    }
}