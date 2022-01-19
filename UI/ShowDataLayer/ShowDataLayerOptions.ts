import FeatureSource from "../../Logic/FeatureSource/FeatureSource";
import {UIEventSource} from "../../Logic/UIEventSource";
import {ElementStorage} from "../../Logic/ElementStorage";
import {OsmConnection} from "../../Logic/Osm/OsmConnection";
import {Changes} from "../../Logic/Osm/Changes";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import FilteredLayer from "../../Models/FilteredLayer";
import BaseLayer from "../../Models/BaseLayer";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import ScrollableFullScreen from "../Base/ScrollableFullScreen";

export interface ShowDataLayerOptions {
    features: FeatureSource,
    selectedElement?: UIEventSource<any>,
    leafletMap: UIEventSource<L.Map>,
    popup?: undefined | ((tags: any, layer: LayerConfig) => ScrollableFullScreen),
    zoomToFeatures?: false | boolean,
    doShowLayer?: UIEventSource<boolean>,
    state?: {allElements?: ElementStorage}
}