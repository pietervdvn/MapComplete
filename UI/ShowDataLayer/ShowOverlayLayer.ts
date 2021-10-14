import TilesourceConfig from "../../Models/ThemeConfig/TilesourceConfig";
import {UIEventSource} from "../../Logic/UIEventSource";
import * as L from "leaflet";

export default class ShowOverlayLayer {
    
    constructor(config: TilesourceConfig,
                leafletMap: UIEventSource<any>,
                isShown: UIEventSource<boolean> = undefined) {
        
        leafletMap.map(leaflet => {
            if(leaflet === undefined){
                return;
            }

            const tileLayer =  L.tileLayer(config.source,
                {
                    attribution: "",
                    maxZoom: config.maxzoom,
                    minZoom: config.minzoom,
                    // @ts-ignore
                    wmts: false,
                });
            
            if(isShown === undefined){
                tileLayer.addTo(leaflet)
            }
            
            isShown?.addCallbackAndRunD(isShown => {
                if(isShown){
                    tileLayer.addTo(leaflet)
                }else{
                    leaflet.removeLayer(tileLayer)
                }
                
            })
            
        } )
        
        
        
    }
    
    
}