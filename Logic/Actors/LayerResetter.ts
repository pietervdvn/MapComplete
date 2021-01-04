import {UIEventSource} from "../UIEventSource";
import BaseLayer from "../../Models/BaseLayer";
import AvailableBaseLayers from "./AvailableBaseLayers";
import Loc from "../../Models/Loc";

/**
 * Sets the current background layer to a layer that is actually available
 */
export default class LayerResetter {
    
    constructor( currentBackgroundLayer: UIEventSource<BaseLayer>,
                 location: UIEventSource<Loc>,
                 availableLayers: UIEventSource<BaseLayer[]>,
                 defaultLayerId: UIEventSource<string> = undefined) {
        defaultLayerId = defaultLayerId ??  new UIEventSource<string>(AvailableBaseLayers.osmCarto.id);
        
        // Change the baselayer back to OSM if we go out of the current range of the layer
        availableLayers.addCallbackAndRun(availableLayers => {
            let defaultLayer = undefined;
            const currentLayer = currentBackgroundLayer.data.id;
            for (const availableLayer of availableLayers) {
                if (availableLayer.id === currentLayer) {

                    if (availableLayer.max_zoom < location.data.zoom) {
                        break;
                    }

                    if (availableLayer.min_zoom > location.data.zoom) {
                        break;
                    }
                    if(availableLayer.id === defaultLayerId.data){
                        defaultLayer = availableLayer;
                    }
                    return; // All good - the current layer still works!
                }
            }
            // Oops, we panned out of range for this layer!
            console.log("AvailableBaseLayers-actor: detected that the current bounds aren't sufficient anymore - reverting to OSM standard")
            currentBackgroundLayer.setData(defaultLayer ?? AvailableBaseLayers.osmCarto);
        });
        
    }
    
}