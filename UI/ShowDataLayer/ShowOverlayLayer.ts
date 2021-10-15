import TilesourceConfig from "../../Models/ThemeConfig/TilesourceConfig";
import {UIEventSource} from "../../Logic/UIEventSource";
import * as L from "leaflet";

export default class ShowOverlayLayer {

    public static implementation: (config: TilesourceConfig,
                                   leafletMap: UIEventSource<any>,
                                   isShown?: UIEventSource<boolean>) => void;
    
    constructor(config: TilesourceConfig,
                leafletMap: UIEventSource<any>,
                isShown: UIEventSource<boolean> = undefined) {
        if(ShowOverlayLayer.implementation === undefined){
            throw "Call ShowOverlayLayerImplemenation.initialize() first before using this"
        }
            ShowOverlayLayer.implementation(config, leafletMap, isShown)
    }
}