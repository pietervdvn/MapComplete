import * as L from "leaflet";
import TilesourceConfig from "../../Models/ThemeConfig/TilesourceConfig";
import {UIEventSource} from "../../Logic/UIEventSource";
import ShowOverlayLayer from "./ShowOverlayLayer";

export default class ShowOverlayLayerImplementation {
    
    public static Implement(){
        ShowOverlayLayer.implementation = ShowOverlayLayerImplementation.AddToMap
    }
    
    public static AddToMap(config: TilesourceConfig,
                           leafletMap: UIEventSource<any>,
                           isShown: UIEventSource<boolean> = undefined){
        leafletMap.map(leaflet => {
            if (leaflet === undefined) {
                return;
            }

            const tileLayer = L.tileLayer(config.source,
                {
                    attribution: "",
                    maxZoom: config.maxzoom,
                    minZoom: config.minzoom,
                    // @ts-ignore
                    wmts: false,
                });

            if (isShown === undefined) {
                tileLayer.addTo(leaflet)
            }

            isShown?.addCallbackAndRunD(isShown => {
                if (isShown) {
                    tileLayer.addTo(leaflet)
                } else {
                    leaflet.removeLayer(tileLayer)
                }

            })

        })
    }
    
}