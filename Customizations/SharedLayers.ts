import * as drinkingWater from "../assets/layers/drinking_water/drinking_water.json";
import * as ghostbikes from "../assets/layers/ghost_bike/ghost_bike.json"
import * as viewpoint from "../assets/layers/viewpoint/viewpoint.json"
import * as bike_parking from "../assets/layers/bike_parking/bike_parking.json"
import * as bike_repair_station from "../assets/layers/bike_repair_station/bike_repair_station.json"
import * as birdhides from "../assets/layers/bird_hide/birdhides.json"
import * as nature_reserve from "../assets/layers/nature_reserve/nature_reserve.json"
import * as bike_cafes from "../assets/layers/bike_cafe/bike_cafes.json"
import * as bike_monitoring_station from "../assets/layers/bike_monitoring_station/bike_monitoring_station.json"
import * as cycling_themed_objects from "../assets/layers/cycling_themed_object/cycling_themed_objects.json"
import * as bike_shops from "../assets/layers/bike_shop/bike_shop.json"
import * as bike_cleaning from "../assets/layers/bike_cleaning/bike_cleaning.json"
import * as bicycle_library from "../assets/layers/bicycle_library/bicycle_library.json"

import * as maps from "../assets/layers/maps/maps.json"
import * as information_boards from "../assets/layers/information_board/information_board.json"
import * as direction from "../assets/layers/direction/direction.json"
import * as surveillance_camera from "../assets/layers/surveillance_cameras/surveillance_cameras.json"
import * as toilets from "../assets/layers/toilets/toilets.json"
import * as bookcases from "../assets/layers/public_bookcases/public_bookcases.json"
import * as tree_nodes from "../assets/layers/trees/tree_nodes.json"
import LayerConfig from "./JSON/LayerConfig";
import {LayerConfigJson} from "./JSON/LayerConfigJson";

export default class SharedLayers {


    private static sharedLayersListRaw : LayerConfigJson[] = [
        drinkingWater,
        ghostbikes,
        viewpoint,
        bike_parking,
        bike_repair_station,
        bike_monitoring_station,
        birdhides,
        nature_reserve,
        bike_cafes,
        bicycle_library,
        cycling_themed_objects,
        bike_shops,
        bike_cleaning,
        maps,
        direction,
        information_boards,
        toilets,
        bookcases,
        surveillance_camera,
        tree_nodes
    ];

    // Must be below the list...
    public static sharedLayers: Map<string, LayerConfig> = SharedLayers.getSharedLayers();
    public static sharedLayersJson: Map<string, any> = SharedLayers.getSharedLayersJson();


    private static getSharedLayers(): Map<string, LayerConfig> {
        const sharedLayers = new Map<string, LayerConfig>();
        for (const layer of SharedLayers.sharedLayersListRaw) {
            const parsed = new LayerConfig(layer,  "shared_layers")
            sharedLayers.set(layer.id, parsed);
            sharedLayers[layer.id] = parsed;
        }
        return sharedLayers;
    }

    private static getSharedLayersJson(): Map<string, any> {
        const sharedLayers = new Map<string, any>();
        for (const layer of SharedLayers.sharedLayersListRaw) {
            sharedLayers.set(layer.id, layer);
            sharedLayers[layer.id] = layer;
        }
        return sharedLayers;
    }


}
