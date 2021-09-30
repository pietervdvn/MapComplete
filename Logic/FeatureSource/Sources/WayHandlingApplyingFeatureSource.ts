/**
 * This is the part of the pipeline which introduces extra points at the center of an area (but only if this is demanded by the wayhandling)
 */
import {UIEventSource} from "../../UIEventSource";
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig";
import {GeoOperations} from "../../GeoOperations";
import {FeatureSourceForLayer} from "../FeatureSource";

export default class WayHandlingApplyingFeatureSource implements FeatureSourceForLayer {
    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]>;
    public readonly name;
    public readonly layer;

    constructor(upstream: FeatureSourceForLayer) {
        
        this.name = "Wayhandling(" + upstream.name + ")";
        this.layer = upstream.layer
        const layer = upstream.layer.layerDef;

        if (layer.wayHandling === LayerConfig.WAYHANDLING_DEFAULT) {
            // We don't have to do anything fancy
            // lets just wire up the upstream
            this.features = upstream.features;
            return;
        }

        this.features = upstream.features.map(
            features => {
                if (features === undefined) {
                    return;
                }
                const newFeatures: { feature: any, freshness: Date }[] = [];
                for (const f of features) {
                    const feat = f.feature;

                    if (layer.wayHandling === LayerConfig.WAYHANDLING_DEFAULT) {
                        newFeatures.push(f);
                        continue;
                    }

                    if (feat.geometry.type === "Point") {
                        newFeatures.push(f);
                        // feature is a point, nothing to do here
                        continue;
                    }

                    // Create the copy
                    const centerPoint = GeoOperations.centerpoint(feat);

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