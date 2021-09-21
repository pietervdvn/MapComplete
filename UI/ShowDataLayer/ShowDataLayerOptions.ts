import FeatureSource from "../../Logic/FeatureSource/FeatureSource";
import {UIEventSource} from "../../Logic/UIEventSource";

export interface ShowDataLayerOptions {
    features: FeatureSource,
    leafletMap: UIEventSource<L.Map>,
    enablePopups?: true | boolean,
    zoomToFeatures?: false | boolean,
}