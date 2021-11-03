import {GeoOperations} from "./GeoOperations";
import Combine from "../UI/Base/Combine";
import RelationsTracker from "./Osm/RelationsTracker";
import State from "../State";
import BaseUIElement from "../UI/BaseUIElement";
import List from "../UI/Base/List";
import Title from "../UI/Base/Title";
import {BBox} from "./BBox";

export interface ExtraFuncParams {
    /**
     * Gets all the features from the given layer within the given BBOX.
     * Note that more features then requested can be given back.
     * Format: [ [ geojson, geojson, geojson, ... ], [geojson, ...], ...]
     */
    getFeaturesWithin: (layerId: string, bbox: BBox) => any[][],
    memberships: RelationsTracker
}


export class ExtraFunction {


    static readonly intro = new Combine([
        new Title("Calculating tags with Javascript", 2),
        "In some cases, it is useful to have some tags calculated based on other properties. Some useful tags are available by default (e.g. `lat`, `lon`, `_country`), as detailed above.",
        "It is also possible to calculate your own tags - but this requires some javascript knowledge.",
        "",
        "Before proceeding, some warnings:",
        new List([
            "DO NOT DO THIS AS BEGINNER",
            "**Only do this if all other techniques fail**  This should _not_ be done to create a rendering effect, only to calculate a specific value",
            "**THIS MIGHT BE DISABLED WITHOUT ANY NOTICE ON UNOFFICIAL THEMES** As unofficial themes might be loaded from the internet, this is the equivalent of injecting arbitrary code into the client. It'll be disabled if abuse occurs."
        ]),
        "To enable this feature,  add a field `calculatedTags` in the layer object, e.g.:",
        "````",
        "\"calculatedTags\": [",
        "    \"_someKey=javascript-expression\",",
        "    \"name=feat.properties.name ?? feat.properties.ref ?? feat.properties.operator\",",
        "    \"_distanceCloserThen3Km=feat.distanceTo( some_lon, some_lat) < 3 ? 'yes' : 'no'\" ",
        "  ]",
        "````",
        "",
        "The above code will be executed for every feature in the layer. The feature is accessible as `feat` and is an amended geojson object:",

        new List([
            "`area` contains the surface area (in square meters) of the object",
            "`lat` and `lon` contain the latitude and longitude"
        ]),
        "Some advanced functions are available on **feat** as well:"
    ]).SetClass("flex-col").AsMarkdown();


    private static readonly OverlapFunc = new ExtraFunction(
        {
            name: "overlapWith",
            doc: "Gives a list of features from the specified layer which this feature (partly) overlaps with. " +
                "If the current feature is a point, all features that embed the point are given. " +
                "The returned value is `{ feat: GeoJSONFeature, overlap: number}[]` where `overlap` is the overlapping surface are (in m²) for areas, the overlapping length (in meter) if the current feature is a line or `undefined` if the current feature is a point.\n" +
                "The resulting list is sorted in descending order by overlap. The feature with the most overlap will thus be the first in the list" +
                "\n" +
                "For example to get all objects which overlap or embed from a layer, use `_contained_climbing_routes_properties=feat.overlapWith('climbing_route')`",
            args: ["...layerIds - one or more layer ids  of the layer from which every feature is checked for overlap)"]
        },
        (params, feat) => {
            return (...layerIds: string[]) => {
                const result : {feat:any, overlap: number}[]= []

                const bbox = BBox.get(feat)

                for (const layerId of layerIds) {
                    const otherLayers = params.getFeaturesWithin(layerId, bbox)
                    if (otherLayers === undefined) {
                        continue;
                    }
                    if (otherLayers.length === 0) {
                        continue;
                    }
                    for (const otherLayer of otherLayers) {
                        result.push(...GeoOperations.calculateOverlap(feat, otherLayer));
                    }
                }
                
                result.sort((a, b) => b.overlap - a.overlap)
                
                return result;
            }
        }
    )
    private static readonly DistanceToFunc = new ExtraFunction(
        {
            name: "distanceTo",
            doc: "Calculates the distance between the feature and a specified point in kilometer. The input should either be a pair of coordinates, a geojson feature or the ID of an object",
            args: ["feature OR featureID OR longitude", "undefined OR latitude"]
        },
        (featuresPerLayer, feature) => {
            return (arg0, lat) => {
                if (arg0 === undefined) {
                    return undefined;
                }
                if (typeof arg0 === "number") {
                    // Feature._lon and ._lat is conveniently place by one of the other metatags
                    return GeoOperations.distanceBetween([arg0, lat], [feature._lon, feature._lat]);
                }
                if (typeof arg0 === "string") {
                    // This is an identifier
                    const feature = State.state.allElements.ContainingFeatures.get(arg0);
                    if (feature === undefined) {
                        return undefined;
                    }
                    arg0 = feature;
                }

                // arg0 is probably a feature
                return GeoOperations.distanceBetween(GeoOperations.centerpointCoordinates(arg0), [feature._lon, feature._lat])

            }
        }
    )
    private static readonly ClosestObjectFunc = new ExtraFunction(
        {
            name: "closest",
            doc: "Given either a list of geojson features or a single layer name, gives the single object which is nearest to the feature. In the case of ways/polygons, only the centerpoint is considered. Returns a single geojson feature or undefined if nothing is found (or not yet laoded)",
            args: ["list of features or a layer name or '*' to get all features"]
        },
        (params, feature) => {
            return (features) => ExtraFunction.GetClosestNFeatures(params, feature, features)?.[0]?.feat
        }
    )

    private static readonly ClosestNObjectFunc = new ExtraFunction(
        {
            name: "closestn",
            doc: "Given either a list of geojson features or a single layer name, gives the n closest objects which are nearest to the feature (excluding the feature itself). In the case of ways/polygons, only the centerpoint is considered. " +
                "Returns a list of `{feat: geojson, distance:number}` the empty list if nothing is found (or not yet loaded)\n\n" +
                "If a 'unique tag key' is given, the tag with this key will only appear once (e.g. if 'name' is given, all features will have a different name)",
            args: ["list of features or layer name or '*' to get all features", "amount of features", "unique tag key (optional)", "maxDistanceInMeters (optional)"]
        },
        (params, feature) => {

            return (features, amount, uniqueTag, maxDistanceInMeters) => {
                let distance: number = Number(maxDistanceInMeters)
                if (isNaN(distance)) {
                    distance = undefined
                }
                return ExtraFunction.GetClosestNFeatures(params, feature, features, {
                    maxFeatures: Number(amount),
                    uniqueTag: uniqueTag,
                    maxDistance: distance
                });
            }
        }
    )

    private static readonly Memberships = new ExtraFunction(
        {
            name: "memberships",
            doc: "Gives a list of `{role: string, relation: Relation}`-objects, containing all the relations that this feature is part of. " +
                "\n\n" +
                "For example: `_part_of_walking_routes=feat.memberships().map(r => r.relation.tags.name).join(';')`",
            args: []
        },
        (params, feat) => {
            return () =>
                params.memberships.knownRelations.data.get(feat.properties.id) ?? []

        }
    )

    private static readonly GetParsed = new ExtraFunction(
        {
            name: "get",
            doc: "Gets the property of the feature, parses it (as JSON) and returns it. Might return 'undefined' if not defined, null, ...",
            args: ["key"]
        },
        (params, feat) => {
            return key => {
                const value = feat.properties[key]
                if (value === undefined) {
                    return undefined;
                }
                try {
                    const parsed = JSON.parse(value)
                    if(parsed === null){
                        return undefined;
                    }
                    return parsed;
                } catch (e) {
                    console.warn("Could not parse property " + key + " due to: " + e + ", the value is " + value)
                    return undefined;
                }

            }

        }
    )

    private static readonly allFuncs: ExtraFunction[] = [
        ExtraFunction.DistanceToFunc,
        ExtraFunction.OverlapFunc,
        ExtraFunction.ClosestObjectFunc,
        ExtraFunction.ClosestNObjectFunc,
        ExtraFunction.Memberships,
        ExtraFunction.GetParsed
    ];
    private readonly _name: string;
    private readonly _args: string[];
    private readonly _doc: string;
    private readonly _f: (params: ExtraFuncParams, feat: any) => any;

    constructor(options: { name: string, doc: string, args: string[] },
                f: ((params: ExtraFuncParams, feat: any) => any)) {
        this._name = options.name;
        this._doc = options.doc;
        this._args = options.args;
        this._f = f;
    }

    public static FullPatchFeature(params: ExtraFuncParams, feature) {
        for (const func of ExtraFunction.allFuncs) {
            func.PatchFeature(params, feature);
        }
    }

    public static HelpText(): BaseUIElement {

        const elems = []
        for (const func of ExtraFunction.allFuncs) {
            elems.push(new Title(func._name, 3),
                func._doc,
                new List(func._args, true))
        }

        return new Combine([
            ExtraFunction.intro,
            new List(ExtraFunction.allFuncs.map(func => func._name)),
            ...elems
        ]);
    }

    /**
     * Gets the closes N features, sorted by ascending distance.
     *
     * @param params: The link to mapcomplete state
     * @param feature: The central feature under consideration
     * @param features: The other features
     * @param options: maxFeatures: The maximum amount of features to be returned. Default: 1; uniqueTag: returned features are not allowed to have the same value for this key; maxDistance: stop searching if it is too far away (in meter). Default: 500m
     * @constructor
     * @private
     */
    private static GetClosestNFeatures(params: ExtraFuncParams,
                                       feature: any,
                                       features: string | any[],
                                       options?: { maxFeatures?: number, uniqueTag?: string | undefined, maxDistance?: number }): { feat: any, distance: number }[] {
        const maxFeatures = options?.maxFeatures ?? 1
        const maxDistance = options?.maxDistance ?? 500
        const uniqueTag: string | undefined = options?.uniqueTag
        if (typeof features === "string") {
            const name = features
            const bbox = GeoOperations.bbox(GeoOperations.buffer(GeoOperations.bbox(feature), maxDistance))
            features = params.getFeaturesWithin(name, new BBox(bbox.geometry.coordinates))
        } else {
            features = [features]
        }
        if (features === undefined) {
            return;
        }

        const selfCenter = GeoOperations.centerpointCoordinates(feature)
        let closestFeatures: { feat: any, distance: number }[] = [];
        for (const featureList of features) {
            for (const otherFeature of featureList) {
                if (otherFeature === feature || otherFeature.properties.id === feature.properties.id) {
                    continue; // We ignore self
                }
                const distance = GeoOperations.distanceBetween(
                    GeoOperations.centerpointCoordinates(otherFeature),
                    selfCenter
                )
                if (distance === undefined || distance === null || isNaN(distance)) {
                    console.error("Could not calculate the distance between", feature, "and", otherFeature)
                    throw "Undefined distance!"
                }

                if (distance === 0) {
                    console.trace("Got a suspiciously zero distance between", otherFeature, "and self-feature", feature)
                }

                if (distance > maxDistance) {
                    continue
                }

                if (closestFeatures.length === 0) {
                    closestFeatures.push({
                        feat: otherFeature,
                        distance: distance
                    })
                    continue;
                }

                if (closestFeatures.length >= maxFeatures && closestFeatures[maxFeatures - 1].distance < distance) {
                    // The last feature of the list (and thus the furthest away is still closer
                    // No use for checking, as we already have plenty of features!
                    continue
                }

                let targetIndex = closestFeatures.length
                for (let i = 0; i < closestFeatures.length; i++) {
                    const closestFeature = closestFeatures[i];

                    if (uniqueTag !== undefined) {
                        const uniqueTagsMatch = otherFeature.properties[uniqueTag] !== undefined &&
                            closestFeature.feat.properties[uniqueTag] === otherFeature.properties[uniqueTag]
                        if (uniqueTagsMatch) {
                            targetIndex = -1
                            if (closestFeature.distance > distance) {
                                // This is a very special situation:
                                // We want to see the tag `uniquetag=some_value` only once in the entire list (e.g. to prevent road segements of identical names to fill up the list of 'names of nearby roads')
                                // AT this point, we have found a closer segment with the same, identical tag
                                // so we replace directly
                                closestFeatures[i] = {feat: otherFeature, distance: distance}
                            }
                            break;
                        }
                    }

                    if (closestFeature.distance > distance) {
                        targetIndex = i

                        if (uniqueTag !== undefined) {
                            const uniqueValue = otherFeature.properties[uniqueTag]
                            // We might still have some other values later one with the same uniquetag that have to be cleaned
                            for (let j = i; j < closestFeatures.length; j++) {
                                if (closestFeatures[j].feat.properties[uniqueTag] === uniqueValue) {
                                    closestFeatures.splice(j, 1)
                                }
                            }
                        }
                        break;
                    }
                }

                if (targetIndex == -1) {
                    continue; // value is already swapped by the unique tag
                }

                if (targetIndex < maxFeatures) {
                    // insert and drop one
                    closestFeatures.splice(targetIndex, 0, {
                        feat: otherFeature,
                        distance: distance
                    })
                    if (closestFeatures.length >= maxFeatures) {
                        closestFeatures.splice(maxFeatures, 1)
                    }
                } else {
                    // Overwrite the last element
                    closestFeatures[targetIndex] = {
                        feat: otherFeature,
                        distance: distance
                    }

                }
            }
        }
        return closestFeatures;
    }

    public PatchFeature(params: ExtraFuncParams, feature: any) {
        feature[this._name] = this._f(params, feature)
    }
}
