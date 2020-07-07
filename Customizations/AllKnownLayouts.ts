import {Groen} from "./Layouts/Groen";
import {Toilets} from "./Layouts/Toilets";
import {GRB} from "./Layouts/GRB";
import {Statues} from "./Layouts/Statues";
import {Bookcases} from "./Layouts/Bookcases";
import { BikePumps } from "./Layers/BikePumps";

export class AllKnownLayouts {
    public static allSets: any = AllKnownLayouts.AllLayouts();

    private static AllLayouts() {
        const layouts = [
            new Groen(),
            new GRB(),
            new BikePumps(),
            /*new Toilets(),
            new Statues(),
            new Bookcases()*/
        ];
        const allSets = {};
        for (const layout of layouts) {
            allSets[layout.name] = layout;
        }
        return allSets;
    }
}
