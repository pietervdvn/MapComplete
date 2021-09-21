import BaseUIElement from "../BaseUIElement";
import Loc from "../../Models/Loc";
import BaseLayer from "../../Models/BaseLayer";
import {BBox} from "../../Logic/GeoOperations";
import {UIEventSource} from "../../Logic/UIEventSource";

export interface MinimapOptions {
    background?: UIEventSource<BaseLayer>,
    location?: UIEventSource<Loc>,
    bounds?: UIEventSource<BBox>,
    allowMoving?: boolean,
    leafletOptions?: any,
    attribution?: BaseUIElement | boolean,
    onFullyLoaded?: (leaflet: L.Map) => void,
    leafletMap?: UIEventSource<any>,
    lastClickLocation?: UIEventSource<{ lat: number, lon: number }>
}

export default class Minimap {
    /**
     * A stub implementation. The actual implementation is injected later on, but only in the browser.
     * importing leaflet crashes node-ts, which is pretty annoying considering the fact that a lot of scripts use it
     */

    /**
     * Construct a minimap
     */
    public static createMiniMap: (options: MinimapOptions) => BaseUIElement & { readonly leafletMap: UIEventSource<any> }

}