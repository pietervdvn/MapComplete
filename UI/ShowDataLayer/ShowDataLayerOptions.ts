import FeatureSource from "../../Logic/FeatureSource/FeatureSource";
import {UIEventSource} from "../../Logic/UIEventSource";
import {ElementStorage} from "../../Logic/ElementStorage";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import ScrollableFullScreen from "../Base/ScrollableFullScreen";

export interface ShowDataLayerOptions {
    features: FeatureSource,
    selectedElement?: UIEventSource<any>,
    leafletMap: UIEventSource<L.Map>,
    popup?: undefined | ((tags: any, layer: LayerConfig) => ScrollableFullScreen),
    zoomToFeatures?: false | boolean,
    doShowLayer?: UIEventSource<boolean>,
    state?: { allElements?: ElementStorage }
}