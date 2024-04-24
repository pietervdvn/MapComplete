import SimpleMetaTaggers, { MetataggingState, SimpleMetaTagger } from "./SimpleMetaTagger"
import { ExtraFuncParams, ExtraFunctions, ExtraFuncType } from "./ExtraFunctions"
import LayerConfig from "../Models/ThemeConfig/LayerConfig"
import { Feature } from "geojson"
import FeaturePropertiesStore from "./FeatureSource/Actors/FeaturePropertiesStore"
import LayoutConfig from "../Models/ThemeConfig/LayoutConfig"
import { GeoIndexedStoreForLayer } from "./FeatureSource/Actors/GeoIndexedStore"
import { IndexedFeatureSource } from "./FeatureSource/FeatureSource"
import OsmObjectDownloader from "./Osm/OsmObjectDownloader"
import { Utils } from "../Utils"
import { Store, UIEventSource } from "./UIEventSource"

/**
 * Metatagging adds various tags to the elements, e.g. lat, lon, surface area, ...
 *
 * All metatags start with an underscore
 */
export default class MetaTagging {
    private static errorPrintCount = 0
    private static readonly stopErrorOutputAt = 10
    private static metataggingObject: any = undefined
    private static retaggingFuncCache = new Map<
        string,
        ((feature: Feature, propertiesStore: UIEventSource<any>) => void)[]
    >()

    constructor(state: {
        readonly selectedElement: Store<Feature>
        readonly layout: LayoutConfig
        readonly osmObjectDownloader: OsmObjectDownloader
        readonly perLayer: ReadonlyMap<string, GeoIndexedStoreForLayer>
        readonly indexedFeatures: IndexedFeatureSource
        readonly featureProperties: FeaturePropertiesStore
    }) {
        const params = MetaTagging.createExtraFuncParams(state)
        for (const layer of state.layout.layers) {
            if (layer.source === null) {
                continue
            }
            const featureSource = state.perLayer.get(layer.id)
            featureSource.features?.stabilized(1000)?.addCallbackAndRunD((features) => {
                if (!(features?.length > 0)) {
                    // No features to handle
                    return
                }
                console.debug(
                    "Recalculating metatags for layer ",
                    layer.id,
                    "due to a change in the upstream features. Contains ",
                    features.length,
                    "items"
                )
                MetaTagging.addMetatags(
                    features,
                    params,
                    layer,
                    state.layout,
                    state.osmObjectDownloader,
                    state.featureProperties
                )
            })
        }

        state.selectedElement.addCallbackAndRunD((feature) => {
            const layer = state.layout.getMatchingLayer(feature.properties)
            // Force update the tags of the currently selected element
            MetaTagging.addMetatags(
                [feature],
                params,
                layer,
                state.layout,
                state.osmObjectDownloader,
                state.featureProperties,
                {
                    evaluateStrict: true,
                }
            )
        })
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * The 'metaTagging'-object is an object which contains some functions.
     * Those functions are named `metaTaggging_for_<layer_name>` and are constructed based on the 'calculatedField' for this layer.
     *
     * If they are set, those functions will be used instead of parsing them at runtime.
     *
     * This means that we can avoid using eval, resulting in faster and safer code (at the cost of more complexity) - at least for official themes.
     *
     * Note: this function might appear unused while developing, it is used in the generated `index_<themename>.ts` files.
     *
     * @param metatagging
     */
    public static setThemeMetatagging(metatagging: any) {
        MetaTagging.metataggingObject = metatagging
    }

    /**
     * This method (re)calculates all metatags and calculated tags on every given feature.
     * The given features should be part of the given layer
     *
     * Returns true if at least one feature has changed properties
     */
    public static addMetatags(
        features: Feature[],
        params: ExtraFuncParams,
        layer: LayerConfig,
        layout: LayoutConfig,
        osmObjectDownloader: OsmObjectDownloader,
        featurePropertiesStores?: FeaturePropertiesStore,
        options?: {
            includeDates?: true | boolean
            includeNonDates?: true | boolean
            evaluateStrict?: false | boolean
        }
    ): boolean {
        if (features === undefined || features.length === 0) {
            return
        }

        const metatagsToApply: SimpleMetaTagger[] = []
        for (const metatag of SimpleMetaTaggers.metatags) {
            if (metatag.includesDates) {
                if (options?.includeDates ?? true) {
                    metatagsToApply.push(metatag)
                }
            } else {
                if (options?.includeNonDates ?? true) {
                    metatagsToApply.push(metatag)
                }
            }
        }

        // The calculated functions - per layer - which add the new keys
        // Calculated functions are defined by the layer
        const layerFuncs = this.createRetaggingFunc(layer, ExtraFunctions.constructHelpers(params))
        const state: MetataggingState = { layout, osmObjectDownloader }

        let atLeastOneFeatureChanged = false
        let strictlyEvaluated = 0
        for (let i = 0; i < features.length; i++) {
            const feature = features[i]
            const tags = featurePropertiesStores?.getStore(feature.properties.id)
            let somethingChanged = false
            let definedTags = new Set(Object.getOwnPropertyNames(feature.properties))

            for (const metatag of metatagsToApply) {
                try {
                    if (!metatag.keys.some((key) => !(key in feature.properties))) {
                        // All keys are already defined, we probably already ran this one
                        // Note that we use 'key in properties', not 'properties[key] === undefined'. The latter will cause evaluation of lazy properties
                        continue
                    }

                    if (metatag.isLazy) {
                        if (!metatag.keys.some((key) => !definedTags.has(key))) {
                            // All keys are defined - lets skip!
                            continue
                        }
                        somethingChanged = true
                        metatag.applyMetaTagsOnFeature(feature, layer, tags, state)
                        if (options?.evaluateStrict) {
                            for (const key of metatag.keys) {
                                const evaluated = feature.properties[key]
                                if (evaluated !== undefined) {
                                    strictlyEvaluated++
                                }
                            }
                        }
                    } else {
                        const newValueAdded = metatag.applyMetaTagsOnFeature(
                            feature,
                            layer,
                            tags,
                            state
                        )
                        /* Note that the expression:
                         * `somethingChanged = newValueAdded || metatag.applyMetaTagsOnFeature(feature, freshness)`
                         * Is WRONG
                         *
                         * IF something changed is `true` due to an earlier run, it will short-circuit and _not_ evaluate the right hand of the OR,
                         * thus not running an update!
                         */
                        somethingChanged = newValueAdded || somethingChanged
                    }
                } catch (e) {
                    console.error(
                        "Could not calculate metatag for ",
                        metatag.keys.join(","),
                        ":",
                        e,
                        e.stack
                    )
                }
            }
            if (layerFuncs !== undefined) {
                try {
                    // We cannot do `somethingChanged || layerFuncs(feature)', due to the shortcutting behaviour it would not calculate the lazy functions
                    somethingChanged = layerFuncs(feature, tags) || somethingChanged
                } catch (e) {
                    console.error(e)
                }
            }

            if (somethingChanged) {
                try {
                    tags?.ping()
                } catch (e) {
                    console.error("Could not ping a store for a changed property due to", e)
                }
                atLeastOneFeatureChanged = true
            }
        }
        return atLeastOneFeatureChanged
    }

    public static createExtraFuncParams(state: {
        indexedFeatures: IndexedFeatureSource
        perLayer: ReadonlyMap<string, GeoIndexedStoreForLayer>
    }) {
        return {
            getFeatureById: (id) => state.indexedFeatures.featuresById.data.get(id),
            getFeaturesWithin: (layerId, bbox) => {
                if (layerId === "*" || layerId === null || layerId === undefined) {
                    const feats: Feature[][] = []
                    state.perLayer.forEach((layer) => {
                        feats.push(layer.GetFeaturesWithin(bbox))
                    })
                    return feats
                }
                if(!state.perLayer.get(layerId)){
                    // This layer is not loaded
                    return []
                }
                return [state.perLayer.get(layerId).GetFeaturesWithin(bbox)]
            },
        }
    }

    /**
     * Creates a function that implements that calculates a property and adds this property onto the feature properties
     * @param specification
     * @param helperFunctions
     * @param layerId
     * @private
     */
    private static createFunctionForFeature(
        [key, code, isStrict]: [string, string, boolean],
        helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>,
        layerId: string = "unkown layer"
    ): ((feature: Feature, propertiesStore?: UIEventSource<any>) => void) | undefined {
        if (code === undefined) {
            return undefined
        }

        const calculateAndAssign: (feat: Feature, store?: UIEventSource<any>) => string | any = (
            feat,
            store
        ) => {
            try {
                let result = new Function(
                    "feat",
                    "{" + ExtraFunctions.types.join(", ") + "}",
                    "return " + code + ";"
                )(feat, helperFunctions)
                if (result === "") {
                    result = undefined
                }
                const oldValue = feat.properties[key]
                if (oldValue == result) {
                    return oldValue
                }
                delete feat.properties[key]
                feat.properties[key] = result
                store?.ping()
                return result
            } catch (e) {
                if (MetaTagging.errorPrintCount < MetaTagging.stopErrorOutputAt) {
                    console.warn(
                        "Could not calculate a " +
                            (isStrict ? "strict " : "") +
                            "calculated tag for key",
                        key,
                        "for feature",
                        feat.properties.id,
                        " defined by",
                        code,
                        "(in layer",
                        layerId +
                            ") due to \n" +
                            e +
                            "\n. Are you the theme creator? Doublecheck your code. Note that the metatags might not be stable on new features",
                        e,
                        e.stack,
                        { feat }
                    )
                    MetaTagging.errorPrintCount++
                    if (MetaTagging.errorPrintCount == MetaTagging.stopErrorOutputAt) {
                        console.error(
                            "Got ",
                            MetaTagging.stopErrorOutputAt,
                            " errors calculating this metatagging - stopping output now"
                        )
                    }
                }
                return undefined
            }
        }

        if (isStrict) {
            return calculateAndAssign
        }
        return (feature: Feature, store?: UIEventSource<any>) => {
            delete feature.properties[key]
            Utils.AddLazyProperty(feature.properties, key, () => calculateAndAssign(feature, store))
        }
    }

    /**
     * Creates the function which adds all the calculated tags to a feature. Called once per layer
     */
    private static createRetaggingFunc(
        layer: LayerConfig,
        helpers: Record<ExtraFuncType, (feature: Feature) => Function>
    ): (feature: Feature, tags: UIEventSource<Record<string, any>>) => boolean {
        if (MetaTagging.metataggingObject) {
            const id = layer.id.replace(/[^a-zA-Z0-9_]/g, "_")

            const funcName = "metaTaggging_for_" + id
            if (typeof MetaTagging.metataggingObject[funcName] !== "function") {
                console.log(MetaTagging.metataggingObject)
                throw (
                    "Error: metatagging-object for this theme does not have an entry at " +
                    funcName +
                    " (or it is not a function)"
                )
            }
            // public metaTaggging_for_walls_and_buildings(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
            //
            const func: (feat: Feature, helperFunctions: Record<string, any>) => void =
                MetaTagging.metataggingObject[funcName]
            return (feature: Feature) => {
                const tags = feature.properties
                if (tags === undefined) {
                    return
                }
                try {
                    func(feature, helpers)
                } catch (e) {
                    console.error("Could not calculate calculated tags in exported class: ", e)
                }
                return true // Something changed
            }
        }

        console.warn(
            "Static MetataggingObject for theme is not set; using `new Function` (aka `eval`) to get calculated tags. This might trip up the CSP"
        )

        const calculatedTags: [string, string, boolean][] = layer.calculatedTags
        if (calculatedTags === undefined || calculatedTags.length === 0) {
            return undefined
        }

        let functions: ((feature: Feature, propertiesStore?: UIEventSource<any>) => void)[] =
            MetaTagging.retaggingFuncCache.get(layer.id)
        if (functions === undefined) {
            functions = calculatedTags.map((spec) =>
                this.createFunctionForFeature(spec, helpers, layer.id)
            )
            MetaTagging.retaggingFuncCache.set(layer.id, functions)
        }

        return (feature: Feature, store: UIEventSource<Record<string, any>>) => {
            const tags = feature.properties
            if (tags === undefined) {
                return
            }

            try {
                for (const f of functions) {
                    f(feature, store)
                }
            } catch (e) {
                console.error("Invalid syntax in calculated tags or some other error: ", e)
            }
            return true // Something changed
        }
    }
}
