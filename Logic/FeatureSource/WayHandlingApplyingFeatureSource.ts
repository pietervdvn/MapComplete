import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import LayerConfig from "../../Customizations/JSON/LayerConfig";
import {GeoOperations} from "../GeoOperations";

/**
 * This is the part of the pipeline which introduces extra points at the center of an area (but only if this is demanded by the wayhandling)
 */
export default class WayHandlingApplyingFeatureSource implements FeatureSource {
    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]>;
    public readonly name;

    constructor(layers: UIEventSource<{
                    layerDef: LayerConfig
                }[]>,
                upstream: FeatureSource) {
        this.name = "Wayhandling of " + upstream.name;
        this.features = upstream.features.map(
            features => {
                if (features === undefined) {
                    return;
                }

                const layerDict = {};
                let allDefaultWayHandling = true;
                for (const layer of layers.data) {
                    layerDict[layer.layerDef.id] = layer;
                    if (layer.layerDef.wayHandling !== LayerConfig.WAYHANDLING_DEFAULT) {
                        allDefaultWayHandling = false;
                    }
                }

                const newFeatures: { feature: any, freshness: Date }[] = [];
                for (const f of features) {
                    const feat = f.feature;
                    const layerId = feat._matching_layer_id;
                    const layer: LayerConfig = layerDict[layerId].layerDef;
                    if (layer === undefined) {
                        console.error("No layer found with id " + layerId);
                        continue;
                    }

                    if (layer.wayHandling === LayerConfig.WAYHANDLING_DEFAULT) {
                        newFeatures.push(f);
                        continue;
                    }

                    if (feat.geometry.type === "Point") {
                        newFeatures.push(f);
                        // it is a point, nothing to do here
                        continue;
                    }

                    // Create the copy
                    const centerPoint = GeoOperations.centerpoint(feat);
                    centerPoint["_matching_layer_id"] = feat._matching_layer_id;

                    newFeatures.push({feature: centerPoint, freshness: f.freshness});
                    if (layer.wayHandling === LayerConfig.WAYHANDLING_CENTER_AND_WAY) {
                        newFeatures.push(f);
                    }

                }
                return newFeatures;
            }
        );

    }

}