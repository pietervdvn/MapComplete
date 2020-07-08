import {Layout} from "../Layout";
import {GrbToFix} from "../Layers/GrbToFix";
import { BikePumps } from "../Layers/BikePumps";
import { BikeParkings } from "../Layers/BikeParkings";

export class BikePumpsLayout extends Layout {
    constructor() {
        super(
            "pomp",
            "Grb import fix tool",
            [new BikePumps(), new BikeParkings()],
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