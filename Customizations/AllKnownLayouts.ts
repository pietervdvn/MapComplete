import * as bookcases from "../assets/themes/bookcases/Bookcases.json";
import * as aed from "../assets/themes/aed/aed.json";
import * as toilets from "../assets/themes/toilets/toilets.json";
import * as artworks from "../assets/themes/artwork/artwork.json";
import * as cyclestreets from "../assets/themes/cyclestreets/cyclestreets.json";
import * as ghostbikes from "../assets/themes/ghostbikes/ghostbikes.json"
import * as cyclofix from "../assets/themes/cyclofix/cyclofix.json"
import * as buurtnatuur from "../assets/themes/buurtnatuur/buurtnatuur.json"
import * as nature from "../assets/themes/nature/nature.json"
import * as maps from "../assets/themes/maps/maps.json"
import * as shops from "../assets/themes/shops/shops.json"
import * as bike_monitoring_stations from "../assets/themes/bike_monitoring_station/bike_monitoring_stations.json"
import * as fritures from "../assets/themes/fritures/fritures.json"
import * as benches from "../assets/themes/benches/benches.json";
import * as charging_stations from "../assets/themes/charging_stations/charging_stations.json"
import * as widths from "../assets/themes/widths/width.json"
import * as drinking_water from "../assets/themes/drinking_water/drinking_water.json"
import * as climbing from "../assets/themes/climbing/climbing.json"
import * as surveillance_cameras from "../assets/themes/surveillance_cameras/surveillance_cameras.json"
import * as trees from "../assets/themes/trees/trees.json"
import * as personal from "../assets/themes/personalLayout/personalLayout.json"
import LayerConfig from "./JSON/LayerConfig";
import LayoutConfig from "./JSON/LayoutConfig";
import SharedLayers from "./SharedLayers";

export class AllKnownLayouts {

    public static allLayers: Map<string, LayerConfig> = undefined;

    private static GenerateCycloFix(): LayoutConfig {
        const layout = new LayoutConfig(cyclofix)
        const now = new Date();
        const m = now.getMonth() + 1;
        const day = new Date().getDate() + 1;
        const date = day + "/" + m;
        if (date === "31/10" || date === "1/11" || date === "2/11") {
            console.log("The current date is ",date,", which means we remember our dead")
            // Around Halloween/Fiesta de muerte/Allerzielen, we remember the dead
            layout.layers.push(
                SharedLayers.sharedLayers.get("ghost_bike")
            );

        }
        return layout;

    }
    public static layoutsList: LayoutConfig[] = [
        new LayoutConfig(personal),
        AllKnownLayouts.GenerateCycloFix(),
        new LayoutConfig(aed),
        new LayoutConfig(bookcases),
        new LayoutConfig(toilets),
        new LayoutConfig(artworks),
        new LayoutConfig(ghostbikes),
        new LayoutConfig(shops),
        new LayoutConfig(drinking_water),
        new LayoutConfig(nature),
        new LayoutConfig(cyclestreets),
        new LayoutConfig(maps),
        new LayoutConfig(fritures),
        new LayoutConfig(benches),
        new LayoutConfig(charging_stations),
        new LayoutConfig(widths),
        new LayoutConfig(buurtnatuur),
        new LayoutConfig(bike_monitoring_stations),
        new LayoutConfig(surveillance_cameras),
        new LayoutConfig(climbing),
        new LayoutConfig(trees),
    ];


    public static allSets: Map<string, LayoutConfig> = AllKnownLayouts.AllLayouts();

    private static AllLayouts(): Map<string, LayoutConfig> {
        this.allLayers = new Map<string, LayerConfig>();
        for (const layout of this.layoutsList) {
            for (let i = 0; i < layout.layers.length; i++) {
                let layer = layout.layers[i];
                if (typeof (layer) === "string") {
                    layer = layout.layers[i] = SharedLayers.sharedLayers.get(layer);
                    if(layer === undefined){
                        console.log("Defined layers are ", SharedLayers.sharedLayers.keys())
                        throw `Layer ${layer} was not found or defined - probably a type was made`
                    }
                }

                if (this.allLayers[layer.id] !== undefined) {
                    continue;
                }
                this.allLayers[layer.id] = layer;
                this.allLayers[layer.id.toLowerCase()] = layer;
            }
        }

        const allSets: Map<string, LayoutConfig> = new Map();
        for (const layout of this.layoutsList) {
            allSets[layout.id] = layout;
            allSets[layout.id.toLowerCase()] = layout;
        }
        return allSets;
    }

}
