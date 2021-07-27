import {GeoOperations} from "./GeoOperations";
import Combine from "../UI/Base/Combine";
import {Relation} from "./Osm/ExtractRelations";
import State from "../State";
import {Utils} from "../Utils";
import BaseUIElement from "../UI/BaseUIElement";
import List from "../UI/Base/List";
import Title from "../UI/Base/Title";
import {UIEventSourceTools} from "./UIEventSource";
import AspectedRouting from "./Osm/aspectedRouting";

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
            doc: "Gives a list of features from the specified layer which this feature (partly) overlaps with. If the current feature is a point, all features that embed the point are given. The returned value is `{ feat: GeoJSONFeature, overlap: number}[]` where `overlap` is the overlapping surface are (in m²) for areas, the overlapping length (in meter) if the current feature is a line or `undefined` if the current feature is a point",
            args: ["...layerIds - one or more layer ids  of the layer from which every feature is checked for overlap)"]
        },
        (params, feat) => {
            return (...layerIds: string[]) => {
                const result = []
                for (const layerId of layerIds) {
                    const otherLayer = params.featuresPerLayer.get(layerId);
                    if (otherLayer === undefined) {
                        continue;
                    }
                    if (otherLayer.length === 0) {
                        continue;
                    }
                    result.push(...GeoOperations.calculateOverlap(feat, otherLayer));
                }
                return result;
            }
        }
    )
    private static readonly DistanceToFunc = new ExtraFunction(
        {
            name: "distanceTo",
            doc: "Calculates the distance between the feature and a specified point in kilometer. The input should either be a pair of coordinates, a geojson feature or the ID of an object",
            args: ["longitude", "latitude"]
        },
        (featuresPerLayer, feature) => {
            return (arg0, lat) => {
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
            doc: "Given either a list of geojson features or a single layer name, gives the single object which is nearest to the feature. In the case of ways/polygons, only the centerpoint is considered.",
            args: ["list of features"]
        },
        (params, feature) => {
            return (features) => {
                if (typeof features === "string") {
                    const name = features
                    features = params.featuresPerLayer.get(features)
                    if (features === undefined) {
                        var keys = Utils.NoNull(Array.from(params.featuresPerLayer.keys()));
                        if (keys.length > 0) {
                            throw `No features defined for ${name}. Defined layers are ${keys.join(", ")}`;
                        } else {
                            // This is the first pass over an external dataset
                            // Other data probably still has to load!
                            return undefined;
                        }

                    }
                }

                let closestFeature = undefined;
                let closestDistance = undefined;
                for (const otherFeature of features) {
                    if (otherFeature == feature || otherFeature.id == feature.id) {
                        continue; // We ignore self
                    }
                    let distance = undefined;
                    if (otherFeature._lon !== undefined && otherFeature._lat !== undefined) {
                        distance = GeoOperations.distanceBetween([otherFeature._lon, otherFeature._lat], [feature._lon, feature._lat]);
                    } else {
                        distance = GeoOperations.distanceBetween(
                            GeoOperations.centerpointCoordinates(otherFeature),
                            [feature._lon, feature._lat]
                        )
                    }
                    if (distance === undefined) {
                        throw "Undefined distance!"
                    }
                    if (closestFeature === undefined || distance < closestDistance) {
                        closestFeature = otherFeature
                        closestDistance = distance;
                    }
                }
                return closestFeature;
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
        (params, _) => {
            return () => params.relations ?? [];
        }
    )

    private static readonly AspectedRouting = new ExtraFunction(
        {
            name: "score",
            doc: "Given the path of an aspected routing json file, will calculate the score. This score is wrapped in a UIEventSource, so for further calculations, use `.map(score => ...)`" +
                "\n\n" +
                "For example: `_comfort_score=feat.score('https://raw.githubusercontent.com/pietervdvn/AspectedRouting/master/Examples/bicycle/aspects/bicycle.comfort.json')`",
            args: ["path"]
        },
        (_, feature) => {
            return (path) => {
                return UIEventSourceTools.downloadJsonCached(path).map(config => {
                    if (config === undefined) {
                        return
                    }
                    return new AspectedRouting(config).evaluate(feature.properties)
                })
            }
        }
    )

    private static readonly allFuncs: ExtraFunction[] = [
        ExtraFunction.DistanceToFunc,
        ExtraFunction.OverlapFunc,
        ExtraFunction.ClosestObjectFunc,
        ExtraFunction.Memberships,
        ExtraFunction.AspectedRouting
    ];
    private readonly _name: string;
    private readonly _args: string[];
    private readonly _doc: string;
    private readonly _f: (params: { featuresPerLayer: Map<string, any[]>, relations: { role: string, relation: Relation }[] }, feat: any) => any;

    constructor(options: { name: string, doc: string, args: string[] },
                f: ((params: { featuresPerLayer: Map<string, any[]>, relations: { role: string, relation: Relation }[] }, feat: any) => any)) {
        this._name = options.name;
        this._doc = options.doc;
        this._args = options.args;
        this._f = f;
    }

    public static FullPatchFeature(featuresPerLayer: Map<string, any[]>, relations: { role: string, relation: Relation }[], feature) {
        for (const func of ExtraFunction.allFuncs) {
            func.PatchFeature(featuresPerLayer, relations, feature);
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

    public PatchFeature(featuresPerLayer: Map<string, any[]>, relations: { role: string, relation: Relation }[], feature: any) {
        feature[this._name] = this._f({featuresPerLayer: featuresPerLayer, relations: relations}, feature)
    }
}
