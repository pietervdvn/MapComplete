import FeatureSource from "../../Logic/FeatureSource/FeatureSource";
import {UIEventSource} from "../../Logic/UIEventSource";
import {ElementStorage} from "../../Logic/ElementStorage";

export interface ShowDataLayerOptions {
    features: FeatureSource,
    selectedElement?: UIEventSource<any>,
    allElements?: ElementStorage,
    leafletMap: UIEventSource<L.Map>,
    enablePopups?: true | boolean,
    zoomToFeatures?: false | boolean,
    doShowLayer?: UIEventSource<boolean>
}