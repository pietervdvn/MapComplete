import BaseLayer from "../../Models/BaseLayer";
import {UIEventSource} from "../UIEventSource";
import Loc from "../../Models/Loc";

export interface AvailableBaseLayersObj {
    readonly osmCarto: BaseLayer;
    layerOverview: BaseLayer[];
    AvailableLayersAt(location: UIEventSource<Loc>): UIEventSource<BaseLayer[]> 
    SelectBestLayerAccordingTo(location: UIEventSource<Loc>, preferedCategory: UIEventSource<string | string[]>): UIEventSource<BaseLayer> ;

}

/**
 * Calculates which layers are available at the current location
 * Changes the basemap
 */
export default class AvailableBaseLayers {
    
    
    public static layerOverview: BaseLayer[];
    public static osmCarto: BaseLayer;

    private static implementation: AvailableBaseLayersObj
    
    static AvailableLayersAt(location: UIEventSource<Loc>): UIEventSource<BaseLayer[]> {
        return AvailableBaseLayers.implementation?.AvailableLayersAt(location) ?? new UIEventSource<BaseLayer[]>([]);
    }

    static SelectBestLayerAccordingTo(location: UIEventSource<Loc>, preferedCategory: UIEventSource<string | string[]>): UIEventSource<BaseLayer> {
        return AvailableBaseLayers.implementation?.SelectBestLayerAccordingTo(location, preferedCategory) ?? new UIEventSource<BaseLayer>(undefined);

    }

    public static implement(backend: AvailableBaseLayersObj){
        AvailableBaseLayers.layerOverview = backend.layerOverview
        AvailableBaseLayers.osmCarto = backend.osmCarto
        AvailableBaseLayers.implementation = backend
    }

}