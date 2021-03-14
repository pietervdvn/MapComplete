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
import * as bicycle_tube_vending_machine from "../assets/layers/bicycle_tube_vending_machine/bicycle_tube_vending_machine.json"
import * as maps from "../assets/layers/maps/maps.json"
import * as information_boards from "../assets/layers/information_board/information_board.json"
import * as direction from "../assets/layers/direction/direction.json"
import * as surveillance_camera from "../assets/layers/surveillance_cameras/surveillance_cameras.json"
import * as toilets from "../assets/layers/toilets/toilets.json"
import * as bookcases from "../assets/layers/public_bookcases/public_bookcases.json"
import * as tree_nodes from "../assets/layers/trees/tree_nodes.json"
import * as benches from "../assets/layers/benches/benches.json"
import * as benches_at_pt from "../assets/layers/benches/benches_at_pt.json"
import * as picnic_tables from "../assets/layers/benches/picnic_tables.json"
import * as play_forest from "../assets/layers/play_forest/play_forest.json"
import * as playground from "../assets/layers/playground/playground.json"
import * as sport_pitch from "../assets/layers/sport_pitch/sport_pitch.json"
import LayerConfig from "./JSON/LayerConfig";
import {LayerConfigJson} from "./JSON/LayerConfigJson";

export default class AllKnownLayers {


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
        bicycle_tube_vending_machine,
        maps,
        direction,
        information_boards,
        toilets,
        bookcases,
        surveillance_camera,
        tree_nodes,
        benches,
        benches_at_pt,
        picnic_tables,
        play_forest,
        playground,
        sport_pitch
    ];

    // Must be below the list...
    public static sharedLayers: Map<string, LayerConfig> = AllKnownLayers.getSharedLayers();
    public static sharedLayersJson: Map<string, any> = AllKnownLayers.getSharedLayersJson();


    private static getSharedLayers(): Map<string, LayerConfig> {
        const sharedLayers = new Map<string, LayerConfig>();
        for (const layer of AllKnownLayers.sharedLayersListRaw) {
            const parsed = new LayerConfig(layer,  "shared_layers")
            sharedLayers.set(layer.id, parsed);
            sharedLayers[layer.id] = parsed;
        }
        return sharedLayers;
    }

    private static getSharedLayersJson(): Map<string, any> {
        const sharedLayers = new Map<string, any>();
        for (const layer of AllKnownLayers.sharedLayersListRaw) {
            sharedLayers.set(layer.id, layer);
            sharedLayers[layer.id] = layer;
        }
        return sharedLayers;
    }


}
