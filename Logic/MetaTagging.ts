import {GeoOperations} from "./GeoOperations";
import LayerConfig from "../Customizations/JSON/LayerConfig";
import SimpleMetaTagger from "./SimpleMetaTagger";

export class ExtraFunction {

    static readonly doc: string = "When the feature is downloaded, some extra tags can be calculated by a javascript snippet. The feature is passed as 'feat'; there are a few functions available on it to handle it - apart from 'feat.tags' which is a classic object containing all the tags."
    private static DistanceToFunc = new ExtraFunction(
        "distanceTo",
        "Calculates the distance between the feature and a specified point",
        ["longitude", "latitude"],
        (feature) => {
            return (lon, lat) => {
                // Feature._lon and ._lat is conveniently place by one of the other metatags
                return GeoOperations.distanceBetween([lon, lat], [feature._lon, feature._lat]);
            }
        }
    )
    private static readonly allFuncs : ExtraFunction[] = [ExtraFunction.DistanceToFunc];
    private readonly _name: string;
    private readonly _args: string[];
    private readonly _doc: string;
    private readonly _f: (feat: any) => any;

    constructor(name: string, doc: string, args: string[], f: ((feat: any) => any)) {
        this._name = name;
        this._doc = doc;
        this._args = args;
        this._f = f;

    }

    public static FullPatchFeature(feature) {
        for (const func of ExtraFunction.allFuncs) {
            func.PatchFeature(feature);
        }
    }

    public PatchFeature(feature: any) {
        feature[this._name] = this._f(feature);
    }
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
    static addMetatags(features: { feature: any; freshness: Date }[], layers: LayerConfig[]) {

        for (const metatag of SimpleMetaTagger.metatags) {
            try {
                metatag.addMetaTags(features);
            } catch (e) {
                console.error("Could not calculate metatag for ", metatag.keys.join(","), ":", e)

            }
        }

        // The functions - per layer - which add the new keys
        const layerFuncs = new Map<string, ((feature: any) => void)>();
        for (const layer of layers) {
            layerFuncs.set(layer.id, this.createRetaggingFunc(layer));
        }

        for (const feature of features) {
            // @ts-ignore
            const key = feature.feature._matching_layer_id;
            const f = layerFuncs.get(key);
            if (f === undefined) {
                continue;
            }

            f(feature.feature)
        }

    }


    private static createRetaggingFunc(layer: LayerConfig): ((feature: any) => void) {
        const calculatedTags: [string, string][] = layer.calculatedTags;
        if (calculatedTags === undefined) {
            return undefined;
        }

        const functions: ((feature: any) => void)[] = [];
        for (const entry of calculatedTags) {
            const key = entry[0]
            const code = entry[1];
            if (code === undefined) {
                continue;
            }

            const func = new Function("feat", "return " + code + ";");

            const f = (feature: any) => {
                feature.properties[key] = func(feature);
            }
            functions.push(f)
        }
        return (feature) => {
            const tags = feature.properties
            if (tags === undefined) {
                return;
            }

            ExtraFunction.FullPatchFeature(feature);

            for (const f of functions) {
                try {
                    f(feature);
                } catch (e) {
                    console.error("While calculating a tag value: ", e)
                }

            }
        }
    }
}
