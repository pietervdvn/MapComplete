import {GeoOperations} from "./GeoOperations";
import {UIElement} from "../UI/UIElement";
import Combine from "../UI/Base/Combine";
import {Relation} from "./Osm/ExtractRelations";
import State from "../State";
import {Utils} from "../Utils";

export class ExtraFunction {


    static readonly intro = `<h2>Calculating tags with Javascript</h2>

<p>In some cases, it is useful to have some tags calculated based on other properties. Some useful tags are available by default (e.g. <b>lat</b>, <b>lon</b>, <b>_country</b>), as detailed above.</p>

<p>It is also possible to calculate your own tags - but this requires some javascript knowledge. </p>

Before proceeding, some warnings:

<ul>
<li> DO NOT DO THIS AS BEGINNER</li>
<li> <b>Only do this if all other techniques fail</b>. This should <i>not</i> be done to create a rendering effect, only to calculate a specific value</li>
<li> <b>THIS MIGHT BE DISABLED WITHOUT ANY NOTICE ON UNOFFICIAL THEMES</b>. As unofficial themes might be loaded from the internet, this is the equivalent of injecting arbitrary code into the client. It'll be disabled if abuse occurs.</li>
</ul>
In the layer object, add a field <b>calculatedTags</b>, e.g.:

<div class="code">
  "calculatedTags": [
    "_someKey=javascript-expression",
    "name=feat.properties.name ?? feat.properties.ref ?? feat.properties.operator",
    "_distanceCloserThen3Km=feat.distanceTo( some_lon, some_lat) < 3 ? 'yes' : 'no'" 
  ]
</div>

The above code will be executed for every feature in the layer. The feature is accessible as <b>feat</b> and is an amended geojson object:
- <b>area</b> contains the surface area (in square meters) of the object
- <b>lat</b> and <b>lon</b> contain the latitude and longitude

Some advanced functions are available on <b>feat</b> as well:

`
    private static readonly OverlapFunc = new ExtraFunction(
        "overlapWith",
        "Gives a list of features from the specified layer which this feature (partly) overlaps with. If the current feature is a point, all features that embed the point are given. The returned value is <code>{ feat: GeoJSONFeature, overlap: number}[]</code> where <code>overlap</code> is the overlapping surface are (in m²) for areas, the overlapping length (in meter) if the current feature is a line or <code>undefined</code> if the current feature is a point",
        ["...layerIds - one or more layer ids  of the layer from which every feature is checked for overlap)"],
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
        "distanceTo",
        "Calculates the distance between the feature and a specified point in kilometer. The input should either be a pair of coordinates, a geojson feature or the ID of an object",
        ["longitude", "latitude"],
        (featuresPerLayer, feature) => {
            return (arg0, lat) => {
                if (typeof arg0 === "number") {
                    // Feature._lon and ._lat is conveniently place by one of the other metatags
                    return GeoOperations.distanceBetween([arg0, lat], [feature._lon, feature._lat]);
                }
                if (typeof arg0 === "string") {
                    // This is an identifier
                    const feature = State.state.allElements.ContainingFeatures.get(arg0);
                    if(feature === undefined){
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
        "closest",
        "Given either a list of geojson features or a single layer name, gives the single object which is nearest to the feature. In the case of ways/polygons, only the centerpoint is considered.",
        ["list of features"],
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
        "memberships",
        "Gives a list of <code>{role: string, relation: Relation}</code>-objects, containing all the relations that this feature is part of. " +
        "\n\n" +
        "For example: <code>_part_of_walking_routes=feat.memberships().map(r => r.relation.tags.name).join(';')</code>",
        [],
        (params, _) => {
            return () => params.relations ?? [];
        }
    )

    private static readonly allFuncs: ExtraFunction[] = [ExtraFunction.DistanceToFunc, ExtraFunction.OverlapFunc, ExtraFunction.ClosestObjectFunc, ExtraFunction.Memberships];
    private readonly _name: string;
    private readonly _args: string[];
    private readonly _doc: string;
    private readonly _f: (params: { featuresPerLayer: Map<string, any[]>, relations: { role: string, relation: Relation }[] }, feat: any) => any;

    constructor(name: string, doc: string, args: string[], f: ((params: { featuresPerLayer: Map<string, any[]>, relations: { role: string, relation: Relation }[] }, feat: any) => any)) {
        this._name = name;
        this._doc = doc;
        this._args = args;
        this._f = f;

    }

    public static FullPatchFeature(featuresPerLayer: Map<string, any[]>, relations: { role: string, relation: Relation }[], feature) {
        for (const func of ExtraFunction.allFuncs) {
            func.PatchFeature(featuresPerLayer, relations, feature);
        }
    }

    public static HelpText(): UIElement {
        return new Combine([
            ExtraFunction.intro,
            "<ul>",
            ...ExtraFunction.allFuncs.map(func =>
                new Combine([
                    "<li>", func._name, "</li>"
                ])
            ),
            "</ul>",
            ...ExtraFunction.allFuncs.map(func =>
                new Combine([
                    "<h3>" + func._name + "</h3>",
                    func._doc,
                    "<ul>",
                    ...func._args.map(arg => "<li>" + arg + "</li>"),
                    "</ul>"
                ])
            )
        ]);
    }

    public PatchFeature(featuresPerLayer: Map<string, any[]>, relations: { role: string, relation: Relation }[], feature: any) {

        feature[this._name] = this._f({featuresPerLayer: featuresPerLayer, relations: relations}, feature);
    }
}
