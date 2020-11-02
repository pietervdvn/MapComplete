import {Layout} from "./Layout";
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

import {PersonalLayout} from "../Logic/PersonalLayout";
import LayerConfig from "./JSON/LayerConfig";
import SharedLayers from "./SharedLayers";

export class AllKnownLayouts {

    public static allLayers: Map<string, LayerConfig> = undefined;

    private static GenerateCycloFix(): Layout {
        const layout = Layout.LayoutFromJSON(cyclofix, SharedLayers.sharedLayers)
        const now = new Date();
        const m = now.getMonth() + 1;
        const day = new Date().getDay() + 1;
        const date = day + "/" + m;
        if (date === "31/10" || date === "1/11" || date === "2/11") {
            // Around Halloween/Fiesta de muerte/Allerzielen, we remember the dead
            layout.layers.push(
                SharedLayers.sharedLayers.get("ghost_bike")
            );

        }
        return layout;

    }

    private static GenerateWidths(): Layout {
        const layout = Layout.LayoutFromJSON(widths, SharedLayers.sharedLayers);

        layout.enableUserBadge = false;
        layout.enableShareScreen = false;
        layout.enableMoreQuests = false;
        layout.enableLayers = false;
        layout.hideFromOverview = true;
        layout.enableSearch = false;
        layout.enableGeolocation = false;
        return layout;
    }

    private static GenerateBuurtNatuur(): Layout {
        const layout = Layout.LayoutFromJSON(buurtnatuur, SharedLayers.sharedLayers);
        layout.enableMoreQuests = false;
        layout.enableShareScreen = false;
        layout.hideFromOverview = true;
        console.log("Buurtnatuur:",layout)
        return layout;
    }

    private static GenerateBikeMonitoringStations(): Layout {
        const layout = Layout.LayoutFromJSON(bike_monitoring_stations, SharedLayers.sharedLayers);
        layout.hideFromOverview = true;
        return layout;
    }
    
    

    public static layoutsList: Layout[] = [
        new PersonalLayout(),
        
        Layout.LayoutFromJSON(shops, SharedLayers.sharedLayers),
        Layout.LayoutFromJSON(bookcases, SharedLayers.sharedLayers),
        Layout.LayoutFromJSON(aed, SharedLayers.sharedLayers),
        Layout.LayoutFromJSON(toilets, SharedLayers.sharedLayers),
        Layout.LayoutFromJSON(artworks, SharedLayers.sharedLayers),
        AllKnownLayouts.GenerateCycloFix(),
        Layout.LayoutFromJSON(ghostbikes, SharedLayers.sharedLayers),
        Layout.LayoutFromJSON(nature, SharedLayers.sharedLayers),
        Layout.LayoutFromJSON(cyclestreets, SharedLayers.sharedLayers),
        Layout.LayoutFromJSON(maps, SharedLayers.sharedLayers),
        Layout.LayoutFromJSON(fritures, SharedLayers.sharedLayers),
        Layout.LayoutFromJSON(benches, SharedLayers.sharedLayers),
        Layout.LayoutFromJSON(charging_stations, SharedLayers.sharedLayers),
        AllKnownLayouts.GenerateWidths(),
        AllKnownLayouts.GenerateBuurtNatuur(),
        AllKnownLayouts.GenerateBikeMonitoringStations(),

    ];


    public static allSets: Map<string, Layout> = AllKnownLayouts.AllLayouts();

    private static AllLayouts(): Map<string, Layout> {
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

        const allSets: Map<string, Layout> = new Map();
        for (const layout of this.layoutsList) {
            allSets[layout.id] = layout;
            allSets[layout.id.toLowerCase()] = layout;
        }
        return allSets;
    }

}
