import { GeoOperations } from "./GeoOperations"
import Combine from "../UI/Base/Combine"
import BaseUIElement from "../UI/BaseUIElement"
import List from "../UI/Base/List"
import Title from "../UI/Base/Title"
import { BBox } from "./BBox"
import { Feature, Geometry, MultiPolygon, Polygon } from "geojson"
import { GeoJSONFeature } from "maplibre-gl"

export interface ExtraFuncParams {
    /**
     * Gets all the features from the given layer within the given BBOX.
     * Note that more features then requested can be given back.
     * Format: [ [ geojson, geojson, geojson, ... ], [geojson, ...], ...]
     */
    getFeaturesWithin: (
        layerId: string,
        bbox: BBox
    ) => Feature<Geometry, Record<string, string>>[][]
    getFeatureById: (id: string) => Feature<Geometry, Record<string, string>>
}

/**
 * Describes a function that is added to a geojson object in order to calculate calculated tags
 */
interface ExtraFunction {
    readonly _name: string
    readonly _args: string[]
    readonly _doc: string
    readonly _f: (params: ExtraFuncParams, feat: Feature<Geometry, any>) => any
}

class EnclosingFunc implements ExtraFunction {
    _name = "enclosingFeatures"
    _doc = [
        "Gives a list of all features in the specified layers which fully contain this object. Returned features will always be (multi)polygons. (LineStrings and Points from the other layers are ignored)",
        "",
        "The result is a list of features: `{feat: Polygon}[]`",
        "This function will never return the feature itself.",
    ].join("\n")
    _args = [
        "...layerIds - one or more layer ids of the layer from which every feature is checked for overlap)",
    ]

    _f(params: ExtraFuncParams, feat: Feature<Geometry, any>) {
        return (...layerIds: string[]) => {
            const result: { feat: any }[] = []
            const bbox = BBox.get(feat)
            const seenIds = new Set<string>()
            seenIds.add(feat.properties.id)
            for (const layerId of layerIds) {
                const otherFeaturess = params.getFeaturesWithin(layerId, bbox)
                if (otherFeaturess === undefined) {
                    continue
                }
                if (otherFeaturess.length === 0) {
                    continue
                }
                for (const otherFeatures of otherFeaturess) {
                    for (const otherFeature of otherFeatures) {
                        if (seenIds.has(otherFeature.properties.id)) {
                            continue
                        }
                        seenIds.add(otherFeature.properties.id)
                        if (
                            otherFeature.geometry.type !== "Polygon" &&
                            otherFeature.geometry.type !== "MultiPolygon"
                        ) {
                            continue
                        }
                        if (
                            GeoOperations.completelyWithin(
                                <Feature>feat,
                                <Feature<Polygon | MultiPolygon, any>>otherFeature
                            )
                        ) {
                            result.push({ feat: otherFeature })
                        }
                    }
                }
            }

            return result
        }
    }
}

class OverlapFunc implements ExtraFunction {
    _name = "overlapWith"
    _doc = [
        "Gives a list of features from the specified layer which this feature (partly) overlaps with. A point which is embedded in the feature is detected as well.",
        "If the current feature is a point, all features that this point is embeded in are given.",
        "",
        "The returned value is `{ feat: GeoJSONFeature, overlap: number}[]` where `overlap` is the overlapping surface are (in m²) for areas, the overlapping length (in meter) if the current feature is a line or `undefined` if the current feature is a point.",
        "The resulting list is sorted in descending order by overlap. The feature with the most overlap will thus be the first in the list.",
        "",
        "For example to get all objects which overlap or embed from a layer, use `_contained_climbing_routes_properties=overlapWith(feat)('climbing_route')`",
        "",
        "Also see [enclosingFeatures](#enclosingFeatures) which can be used to get all objects which fully contain this feature",
    ].join("\n")
    _args = [
        "...layerIds - one or more layer ids of the layer from which every feature is checked for overlap)",
    ]

    _f(params, feat) {
        return (...layerIds: string[]) => {
            const result: { feat: any; overlap: number }[] = []
            const seenIds = new Set<string>()
            const bbox = BBox.get(feat)
            for (const layerId of layerIds) {
                const otherFeaturess = params.getFeaturesWithin(layerId, bbox)
                if (otherFeaturess === undefined) {
                    continue
                }
                if (otherFeaturess.length === 0) {
                    continue
                }
                for (const otherFeatures of otherFeaturess) {
                    const overlap = GeoOperations.calculateOverlap(feat, otherFeatures)
                    for (const overlappingFeature of overlap) {
                        if (seenIds.has(overlappingFeature.feat.properties.id)) {
                            continue
                        }
                        seenIds.add(overlappingFeature.feat.properties.id)
                        result.push(overlappingFeature)
                    }
                }
            }

            result.sort((a, b) => b.overlap - a.overlap)
            return result
        }
    }
}

class IntersectionFunc implements ExtraFunction {
    _name = "intersectionsWith"
    _doc =
        "Gives the intersection points with selected features. Only works with (Multi)Polygons and LineStrings.\n\n" +
        "Returns a `{feat: GeoJson, intersections: [number,number][]}` where `feat` is the full, original feature. This list is in random order.\n\n" +
        "If the current feature is a point, this function will return an empty list.\n" +
        "Points from other layers are ignored - even if the points are parts of the current linestring."
    _args = [
        "...layerIds - one or more layer ids of the layer from which every feature is checked for intersection)",
    ]

    _f(params: ExtraFuncParams, feat) {
        return (...layerIds: string[]) => {
            const result: { feat: any; intersections: [number, number][] }[] = []

            const bbox = BBox.get(feat)

            for (const layerId of layerIds) {
                const otherLayers = params.getFeaturesWithin(layerId, bbox)
                if (otherLayers === undefined) {
                    continue
                }
                if (otherLayers.length === 0) {
                    continue
                }
                for (const otherFeatures of otherLayers) {
                    for (const otherFeature of otherFeatures) {
                        const intersections = GeoOperations.LineIntersections(
                            feat,
                            <Feature<any, Record<string, string>>>otherFeature
                        )
                        if (intersections.length === 0) {
                            continue
                        }
                        result.push({ feat: otherFeature, intersections })
                    }
                }
            }

            return result
        }
    }
}

class DistanceToFunc implements ExtraFunction {
    _name = "distanceTo"
    _doc =
        "Calculates the distance between the feature and a specified point in meter. The input should either be a pair of coordinates, a geojson feature or the ID of an object"
    _args = ["feature OR featureID OR longitude", "undefined OR latitude"]

    _f(featuresPerLayer, feature) {
        return (arg0, lat) => {
            if (arg0 === undefined) {
                return undefined
            }
            if (typeof arg0 === "number") {
                // Feature._lon and ._lat is conveniently place by one of the other metatags
                return GeoOperations.distanceBetween(
                    [arg0, lat],
                    GeoOperations.centerpointCoordinates(feature)
                )
            }
            if (typeof arg0 === "string") {
                // This is an identifier
                const feature = featuresPerLayer.getFeatureById(arg0)
                if (feature === undefined) {
                    return undefined
                }
                arg0 = feature
            }

            // arg0 is probably a geojsonfeature
            return GeoOperations.distanceBetween(
                GeoOperations.centerpointCoordinates(arg0),
                GeoOperations.centerpointCoordinates(feature)
            )
        }
    }
}

class ClosestObjectFunc implements ExtraFunction {
    _name = "closest"
    _doc =
        "Given either a list of geojson features or a single layer name, gives the single object which is nearest to the feature. In the case of ways/polygons, only the centerpoint is considered. Returns a single geojson feature or undefined if nothing is found (or not yet loaded)"

    _args = ["list of features or a layer name or '*' to get all features"]

    _f(params, feature) {
        return (features) =>
            ClosestNObjectFunc.GetClosestNFeatures(params, feature, features)?.[0]?.feat
    }
}

class ClosestNObjectFunc implements ExtraFunction {
    _name = "closestn"
    _doc =
        "Given either a list of geojson features or a single layer name, gives the n closest objects which are nearest to the feature (excluding the feature itself). In the case of ways/polygons, only the centerpoint is considered. " +
        "Returns a list of `{feat: geojson, distance:number}` the empty list if nothing is found (or not yet loaded)\n\n" +
        "If a 'unique tag key' is given, the tag with this key will only appear once (e.g. if 'name' is given, all features will have a different name)"
    _args = [
        "list of features or layer name or '*' to get all features",
        "amount of features",
        "unique tag key (optional)",
        "maxDistanceInMeters (optional)",
    ]

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
    static GetClosestNFeatures(
        params: ExtraFuncParams,
        feature: any,
        features: string | string[] | Feature[],
        options?: { maxFeatures?: number; uniqueTag?: string | undefined; maxDistance?: number }
    ): { feat: any; distance: number }[] {
        const maxFeatures = options?.maxFeatures ?? 1
        const maxDistance = options?.maxDistance ?? 500
        const uniqueTag: string | undefined = options?.uniqueTag
        if (typeof features === "string") {
            features = [features]
        }

        let allFeatures: Feature[][] = []
        for (const spec of features) {
            if (typeof spec === "string") {
                const name = spec
                const bbox = GeoOperations.bbox(
                    GeoOperations.buffer(GeoOperations.bbox(feature), maxDistance)
                )
                const coors = <[number, number][]>bbox.geometry.coordinates
                allFeatures.push(...params.getFeaturesWithin(name, new BBox(coors)))
            } else {
                allFeatures.push([spec])
            }
        }

        if (features === undefined) {
            return
        }

        const selfCenter = GeoOperations.centerpointCoordinates(feature)
        let closestFeatures: { feat: any; distance: number }[] = []

        for (const feats of allFeatures ?? []) {
            for (const otherFeature of feats) {
                if (otherFeature.properties === undefined) {
                    console.warn("OtherFeature does not have properties:", otherFeature)
                }
                if (
                    otherFeature === feature ||
                    otherFeature.properties.id === feature.properties.id
                ) {
                    continue // We ignore self
                }
                const distance = GeoOperations.distanceBetween(
                    GeoOperations.centerpointCoordinates(otherFeature),
                    selfCenter
                )
                if (distance === undefined || distance === null || isNaN(distance)) {
                    console.error(
                        "Could not calculate the distance between",
                        feature,
                        "and",
                        otherFeature
                    )
                    throw "Undefined distance!"
                }

                if (distance === 0) {
                    console.trace(
                        "Got a suspiciously zero distance between",
                        otherFeature,
                        "and self-feature",
                        feature
                    )
                }

                if (distance > maxDistance) {
                    continue
                }

                if (closestFeatures.length === 0) {
                    // This is the first matching feature we find - always add it
                    closestFeatures.push({
                        feat: otherFeature,
                        distance: distance,
                    })
                    continue
                }

                if (
                    closestFeatures.length >= maxFeatures &&
                    closestFeatures[maxFeatures - 1].distance < distance
                ) {
                    // The last feature of the list (and thus the furthest away is still closer
                    // No use for checking, as we already have plenty of features!
                    continue
                }

                let targetIndex = closestFeatures.length
                for (let i = 0; i < closestFeatures.length; i++) {
                    const closestFeature = closestFeatures[i]

                    if (uniqueTag !== undefined) {
                        const uniqueTagsMatch =
                            otherFeature.properties[uniqueTag] !== undefined &&
                            closestFeature.feat.properties[uniqueTag] ===
                                otherFeature.properties[uniqueTag]
                        if (uniqueTagsMatch) {
                            targetIndex = -1
                            if (closestFeature.distance > distance) {
                                // This is a very special situation:
                                // We want to see the tag `uniquetag=some_value` only once in the entire list (e.g. to prevent road segements of identical names to fill up the list of 'names of nearby roads')
                                // AT this point, we have found a closer segment with the same, identical tag
                                // so we replace directly
                                closestFeatures[i] = { feat: otherFeature, distance: distance }
                            }
                            break
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
                        break
                    }
                }

                if (targetIndex == -1) {
                    continue // value is already swapped by the unique tag
                }

                if (targetIndex < maxFeatures) {
                    // insert and drop one
                    closestFeatures.splice(targetIndex, 0, {
                        feat: otherFeature,
                        distance: distance,
                    })
                    if (closestFeatures.length >= maxFeatures) {
                        closestFeatures.splice(maxFeatures, 1)
                    }
                } else {
                    // Overwrite the last element
                    closestFeatures[targetIndex] = {
                        feat: otherFeature,
                        distance: distance,
                    }
                }
            }
        }
        return closestFeatures
    }

    _f(params, feature) {
        return (features, amount, uniqueTag, maxDistanceInMeters) => {
            let distance: number = Number(maxDistanceInMeters)
            if (isNaN(distance)) {
                distance = undefined
            }
            return ClosestNObjectFunc.GetClosestNFeatures(params, feature, features, {
                maxFeatures: Number(amount),
                uniqueTag: uniqueTag,
                maxDistance: distance,
            })
        }
    }
}

class GetParsed implements ExtraFunction {
    _name = "get"
    _doc =
        "Gets the property of the feature, parses it (as JSON) and returns it. Might return 'undefined' if not defined, null, ..."
    _args = ["key"]

    _f(params, feat) {
        return (key) => {
            const value = feat.properties[key]
            if (value === undefined) {
                return undefined
            }
            if (typeof value !== "string") {
                return value
            }
            try {
                const parsed = JSON.parse(value)
                if (parsed === null) {
                    return undefined
                }
                return parsed
            } catch (e) {
                console.warn(
                    "Could not parse property " + key + " due to: " + e + ", the value is " + value
                )
                return undefined
            }
        }
    }
}

export type ExtraFuncType = (typeof ExtraFunctions.types)[number]

export class ExtraFunctions {
    static readonly intro = new Combine([
        new Title("Calculating tags with Javascript", 2),
        "In some cases, it is useful to have some tags calculated based on other properties. Some useful tags are available by default (e.g. `lat`, `lon`, `_country`), as detailed above.",
        "It is also possible to calculate your own tags - but this requires some javascript knowledge.",
        "",
        "Before proceeding, some warnings:",
        new List([
            "DO NOT DO THIS AS BEGINNER",
            "**Only do this if all other techniques fail**  This should _not_ be done to create a rendering effect, only to calculate a specific value",
            "**THIS MIGHT BE DISABLED WITHOUT ANY NOTICE ON UNOFFICIAL THEMES** As unofficial themes might be loaded from the internet, this is the equivalent of injecting arbitrary code into the client. It'll be disabled if abuse occurs.",
        ]),
        "To enable this feature,  add a field `calculatedTags` in the layer object, e.g.:",
        "````",
        '"calculatedTags": [',
        '    "_someKey=javascript-expression (lazy execution)",',
        '    "_some_other_key:=javascript expression (strict execution)',
        '    "name=feat.properties.name ?? feat.properties.ref ?? feat.properties.operator",',
        "    \"_distanceCloserThen3Km=distanceTo(feat)( some_lon, some_lat) < 3 ? 'yes' : 'no'\" ",
        "  ]",
        "````",
        "",
        "By using `:=` as separator, the attribute will be calculated as soon as the data is loaded (strict evaluation)",
        "The default behaviour, using `=` as separator, is lazy loading",
        "",
        "The above code will be executed for every feature in the layer. The feature is accessible as `feat` and is an amended geojson object:",

        new List([
            "`area` contains the surface area (in square meters) of the object",
            "`lat` and `lon` contain the latitude and longitude",
        ]),
        "Some advanced functions are available as well. Due to technical reasons, they should be used as `funcname(feat)(arguments)`.",
    ])
        .SetClass("flex-col")
        .AsMarkdown()

    static readonly types = [
        "distanceTo",
        "overlapWith",
        "enclosingFeatures",
        "intersectionsWith",
        "closest",
        "closestn",
        "get",
    ] as const
    private static readonly allFuncs = [
        new DistanceToFunc(),
        new OverlapFunc(),
        new EnclosingFunc(),
        new IntersectionFunc(),
        new ClosestObjectFunc(),
        new ClosestNObjectFunc(),
        new GetParsed(),
    ]

    public static constructHelpers(
        params: ExtraFuncParams
    ): Record<ExtraFuncType, (feature: Feature) => Function> {
        const record: Record<string, (feature: GeoJSONFeature) => Function> = {}
        for (const f of ExtraFunctions.allFuncs) {
            if (this.types.indexOf(<any>f._name) < 0) {
                throw "Invalid extraFunc-type: " + f._name
            }
            record[f._name] = (feat) => f._f(params, feat)
        }
        return record
    }

    public static HelpText(): BaseUIElement {
        const elems = []
        for (const func of ExtraFunctions.allFuncs) {
            elems.push(new Title(func._name, 3), func._doc, new List(func._args ?? [], true))
        }

        return new Combine([
            ExtraFunctions.intro,
            new List(ExtraFunctions.allFuncs.map((func) => `[${func._name}](#${func._name})`)),
            ...elems,
        ])
    }
}
