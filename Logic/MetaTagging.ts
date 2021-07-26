import LayerConfig from "../Customizations/JSON/LayerConfig";
import SimpleMetaTagger from "./SimpleMetaTagger";
import {ExtraFunction} from "./ExtraFunction";
import {Relation} from "./Osm/ExtractRelations";
import {UIEventSource} from "./UIEventSource";


interface Params {
    featuresPerLayer: Map<string, any[]>,
    memberships: Map<string, { role: string, relation: Relation }[]>
}

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
    static addMetatags(features: { feature: any; freshness: Date }[],
                       allKnownFeatures: UIEventSource<{ feature: any; freshness: Date }[]>,
                       relations: Map<string, { role: string, relation: Relation }[]>,
                       layers: LayerConfig[],
                       includeDates = true) {

        if (features === undefined || features.length === 0) {
            return;
        }

        for (const metatag of SimpleMetaTagger.metatags) {
            if (metatag.includesDates && !includeDates) {
                // We do not add dated entries
                continue;
            }
            try {
                metatag.addMetaTags(features);
            } catch (e) {
                console.error("Could not calculate metatag for ", metatag.keys.join(","), ":", e)

            }
        }

        // The functions - per layer - which add the new keys
        const layerFuncs = new Map<string, ((params: Params, feature: any) => void)>();
        for (const layer of layers) {
            layerFuncs.set(layer.id, this.createRetaggingFunc(layer));
        }

        allKnownFeatures.addCallbackAndRunD(newFeatures => {

            const featuresPerLayer = new Map<string, any[]>();
            const allFeatures = Array.from(new Set(features.concat(newFeatures)))
            for (const feature of allFeatures) {

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

                try {
                    f({featuresPerLayer: featuresPerLayer, memberships: relations}, feature.feature)
                } catch (e) {
                    console.error(e)
                }

            }


        })


    }

    private static errorPrintCount = 0;
    private static readonly stopErrorOutputAt = 10;

    private static createRetaggingFunc(layer: LayerConfig):
        ((params: Params, feature: any) => void) {
        const calculatedTags: [string, string][] = layer.calculatedTags;
        if (calculatedTags === undefined) {
            return undefined;
        }

        const functions: ((params: Params, feature: any) => void)[] = [];
        for (const entry of calculatedTags) {
            const key = entry[0]
            const code = entry[1];
            if (code === undefined) {
                continue;
            }
            const func = new Function("feat", "return " + code + ";");

            try {


                const f = (featuresPerLayer, feature: any) => {
                    try {
                        let result = func(feature);
                        if(result instanceof UIEventSource){
                            result.addCallbackAndRunD(d => {
                                if (typeof d !== "string") {
                                    // Make sure it is a string!
                                    d = JSON.stringify(d);
                                }
                                feature.properties[key] = d;
                            })
                            result = result.data
                        }
                        
                        if (result === undefined || result === "") {
                            return;
                        }
                        if (typeof result !== "string") {
                            // Make sure it is a string!
                            result = JSON.stringify(result);
                        }
                        feature.properties[key] = result;
                    } catch (e) {
                        if (MetaTagging.errorPrintCount < MetaTagging.stopErrorOutputAt) {
                            console.warn("Could not calculate a calculated tag defined by " + code + " due to " + e + ". This is code defined in the theme. Are you the theme creator? Doublecheck your code. Note that the metatags might not be stable on new features", e)
                            MetaTagging.errorPrintCount++;
                            if (MetaTagging.errorPrintCount == MetaTagging.stopErrorOutputAt) {
                                console.error("Got ", MetaTagging.stopErrorOutputAt, " errors calculating this metatagging - stopping output now")
                            }
                        }
                    }

                }
                functions.push(f)
            } catch (e) {
                console.error("Could not create a dynamic function: ", e)
            }
        }
        return (params: Params, feature) => {
            const tags = feature.properties
            if (tags === undefined) {
                return;
            }

            const relations = params.memberships?.get(feature.properties.id) ?? []
            ExtraFunction.FullPatchFeature(params.featuresPerLayer, relations, feature);
            try {
                for (const f of functions) {
                    f(params, feature);
                }
            } catch (e) {
                console.error("While calculating a tag value: ", e)
            }
        }
    }


}
