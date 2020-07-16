import { Groen } from "./Layouts/Groen";
import { Toilets } from "./Layouts/Toilets";
import { GRB } from "./Layouts/GRB";
import { Statues } from "./Layouts/Statues";
import { Bookcases } from "./Layouts/Bookcases";
import Cyclofix from "./Layouts/Cyclofix";
import { WalkByBrussels } from "./Layouts/WalkByBrussels";
import { All } from "./Layouts/All";
import { Layout } from "./Layout";

export class AllKnownLayouts {
    public static allSets: any = AllKnownLayouts.AllLayouts();

    private static AllLayouts(): any {
        const all = new All();
        const layouts: Layout[] = [
            new Groen(),
            new GRB(),
            new Cyclofix(),
            new Bookcases(),
            new WalkByBrussels(),
            all
            /*new Toilets(),
            new Statues(),
            */
        ];
        const allSets = {};
        for (const layout of layouts) {
            allSets[layout.name] = layout;
            all.layers = all.layers.concat(layout.layers);
        }
        return allSets;
    }

    public static GetSets(layoutNames): any {
        const all = new All();
        for (const name of layoutNames) {
            all.layers = all.layers.concat(AllKnownLayouts.allSets[name].layers);
        }

        return all;
    }
}
