import {Layout} from "../Layout";
import {GrbToFix} from "../Layers/GrbToFix";

export class GRB extends Layout {
    constructor() {
        super("grb",
            ["en"],
            "Grb import fix tool",
            [new GrbToFix()],
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