
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
import * as maps from "../assets/layers/maps/maps.json"
import * as information_boards from "../assets/layers/information_board/information_board.json"
import LayerConfig from "./JSON/LayerConfig";

export default class SharedLayers {
    
    
    

    public static sharedLayers: Map<string, LayerConfig> = SharedLayers.getSharedLayers();

    private static getSharedLayers(){
        const sharedLayersList = [
            new LayerConfig(drinkingWater, "shared_layers"),
            new LayerConfig(ghostbikes, "shared_layers"),
            new LayerConfig(viewpoint, "shared_layers"),
            new LayerConfig(bike_parking, "shared_layers"),
            new LayerConfig(bike_repair_station, "shared_layers"),
            new LayerConfig(bike_monitoring_station, "shared_layers"),
            new LayerConfig(birdhides, "shared_layers"),
            new LayerConfig(nature_reserve, "shared_layers"),
            new LayerConfig(bike_cafes, "shared_layers"),
            new LayerConfig(cycling_themed_objects, "shared_layers"),
            new LayerConfig(bike_shops, "shared_layers"),
            new LayerConfig(maps, "shared_layers"),
            new LayerConfig(information_boards, "shared_layers") 
        ];

        const sharedLayers = new Map<string, LayerConfig>();
        for (const layer of sharedLayersList) {
            sharedLayers.set(layer.id, layer);
            sharedLayers[layer.id] = layer;
        }
        return sharedLayers;
    }
    
    
}