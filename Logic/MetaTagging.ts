import LayerConfig from "../Customizations/JSON/LayerConfig";
import SimpleMetaTagger from "./SimpleMetaTagger";
import {ExtraFunction} from "./ExtraFunction";

/**
 * Metatagging adds various tags to the elements, e.g. lat, lon, surface area, ...
 *
 * All metatags start with an underscore
 */
export default class MetaTagging {


    /**
     * An actor which adds metatags on every feature in the given object
     * The features are a list of geojson-features, with a "properties"-field and geometry
     */
    static addMetatags(features: { feature: any; freshness: Date }[], layers: LayerConfig[]) {

        for (const metatag of SimpleMetaTagger.metatags) {
            try {
                metatag.addMetaTags(features);
            } catch (e) {
                console.error("Could not calculate metatag for ", metatag.keys.join(","), ":", e)

            }
        }

        // The functions - per layer - which add the new keys
        const layerFuncs = new Map<string, ((featursPerLayer: Map<string, any[]>, feature: any) => void)>();
        for (const layer of layers) {
            layerFuncs.set(layer.id, this.createRetaggingFunc(layer));
        }

        const featuresPerLayer = new Map<string, any[]>();
        for (const feature of features) {

            const key = feature.feature._matching_layer_id;
            if (!featuresPerLayer.has(key)) {
                featuresPerLayer.set(key, [])
            }
            featuresPerLayer.get(key).push(feature.feature)
        }

        for (const feature of features) {
            // @ts-ignore
            const key = feature.feature._matching_layer_id;
            const f = layerFuncs.get(key);
            if (f === undefined) {
                continue;
            }

            f(featuresPerLayer, feature.feature)
        }

    }


    private static createRetaggingFunc(layer: LayerConfig): ((featuresPerLayer: Map<string, any[]>, feature: any) => void) {
        const calculatedTags: [string, string][] = layer.calculatedTags;
        if (calculatedTags === undefined) {
            return undefined;
        }

        const functions: ((featuresPerLayer: Map<string, any[]>, feature: any) => void)[] = [];
        for (const entry of calculatedTags) {
            const key = entry[0]
            const code = entry[1];
            if (code === undefined) {
                continue;
            }

            const func = new Function("feat", "return " + code + ";");

            const f = (featuresPerLayer, feature: any) => {
                feature.properties[key] = func(feature);
            }
            functions.push(f)
        }
        return (featuresPerLayer: Map<string, any[]>, feature) => {
            const tags = feature.properties
            if (tags === undefined) {
                return;
            }

            ExtraFunction.FullPatchFeature(featuresPerLayer, feature);
            try {
                for (const f of functions) {
                    f(featuresPerLayer, feature);
                }
            } catch (e) {
                console.error("While calculating a tag value: ", e)
            }
        }
    }


}
