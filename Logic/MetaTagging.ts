import SimpleMetaTagger from "./SimpleMetaTagger";
import {ExtraFuncParams, ExtraFunction} from "./ExtraFunction";
import {UIEventSource} from "./UIEventSource";
import LayerConfig from "../Models/ThemeConfig/LayerConfig";
import State from "../State";


/**
 * Metatagging adds various tags to the elements, e.g. lat, lon, surface area, ...
 *
 * All metatags start with an underscore
 */
export default class MetaTagging {


    private static errorPrintCount = 0;
    private static readonly stopErrorOutputAt = 10;

    /**
     * This method (re)calculates all metatags and calculated tags on every given object.
     * The given features should be part of the given layer
     */
    public static addMetatags(features: { feature: any; freshness: Date }[],
                              params: ExtraFuncParams,
                              layer: LayerConfig,
                              options?: {
                                  includeDates?: true | boolean,
                                  includeNonDates?: true | boolean
                              }) {

        if (features === undefined || features.length === 0) {
            return;
        }


            const metatagsToApply: SimpleMetaTagger [] = []
            for (const metatag of SimpleMetaTagger.metatags) {
                if (metatag.includesDates) {
                    if (options.includeDates ?? true) {
                        metatagsToApply.push(metatag)
                    }
                } else {
                    if (options.includeNonDates ?? true) {
                        metatagsToApply.push(metatag)
                    }
                }
            }

        // The calculated functions - per layer - which add the new keys
        const layerFuncs = this.createRetaggingFunc(layer)


        for (let i = 0; i < features.length; i++) {
                const ff = features[i];
                const feature = ff.feature
                const freshness = ff.freshness
                let somethingChanged = false
                for (const metatag of metatagsToApply) {
                    try {
                        if(!metatag.keys.some(key => feature.properties[key] === undefined)){
                            // All keys are already defined, we probably already ran this one
                            continue
                        }
                        somethingChanged = somethingChanged || metatag.applyMetaTagsOnFeature(feature, freshness)
                    } catch (e) {
                        console.error("Could not calculate metatag for ", metatag.keys.join(","), ":", e)
                    }
                }
                
                if(layerFuncs !== undefined){
                    try {
                        layerFuncs(params, feature)
                    } catch (e) {
                        console.error(e)
                    }
                    somethingChanged = true
                }
                
                if(somethingChanged){
                    State.state.allElements.getEventSourceById(feature.properties.id).ping()
                }
            }
    }


    private static createRetaggingFunc(layer: LayerConfig):
        ((params: ExtraFuncParams, feature: any) => void) {
        const calculatedTags: [string, string][] = layer.calculatedTags;
        if (calculatedTags === undefined) {
            return undefined;
        }

        const functions: ((params: ExtraFuncParams, feature: any) => void)[] = [];
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
                        if (result instanceof UIEventSource) {
                            result.addCallbackAndRunD(d => {
                                if (typeof d !== "string") {
                                    // Make sure it is a string!
                                    d = JSON.stringify(d);
                                }
                                feature.properties[key] = d;
                                console.log("Written a delayed calculated tag onto ", feature.properties.id, ": ", key, ":==", d)
                            })
                            result = result.data
                        }

                        if (result === undefined || result === "") {
                            console.log("Calculated tag for", key, "gave undefined", feature.properties.id)
                            return;
                        }
                        if (typeof result !== "string") {
                            // Make sure it is a string!
                            result = JSON.stringify(result);
                        }
                        feature.properties[key] = result;
                        console.log("Written a calculated tag onto ", feature.properties.id, ": ", key, ":==", result)
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
        return (params: ExtraFuncParams, feature) => {
            const tags = feature.properties
            if (tags === undefined) {
                return;
            }

            ExtraFunction.FullPatchFeature(params, feature);
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
