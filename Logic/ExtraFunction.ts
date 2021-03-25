import {GeoOperations} from "./GeoOperations";
import {UIElement} from "../UI/UIElement";
import Combine from "../UI/Base/Combine";

export class ExtraFunction {


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
    private static readonly allFuncs: ExtraFunction[] = [ExtraFunction.DistanceToFunc];
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

    public static HelpText(): UIElement {
        return new Combine([
            ExtraFunction.intro,
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

    public PatchFeature(feature: any) {
        feature[this._name] = this._f(feature);
    }

    static readonly intro = `<h2>Calculating tags with Javascript</h2>

<p>In some cases, it is useful to have some tags calculated based on other properties. Some useful tags are available by default (e.g. <b>_lat</b>, <b>lon</b>, <b>_country</b>), as detailed above.</p>

<p>It is also possible to calculate your own tags - but this requires some javascript knowledge. </p>

Before proceeding, some warnings:

<ul>
<li> DO NOT DO THIS AS BEGINNER</li>
<li> <b>Only do this if all other techniques fail</b>. This should <i>not</i> be done to create a rendering effect, only to calculate a specific value</li>
<li> <b>THIS MIGHT BE DISABLED WITHOUT ANY NOTICE ON UNOFFICIAL THEMES</b>. As unofficial themes might be loaded from the internet, this is the equivalent of injecting arbitrary code into the client. It'll be disabled if abuse occurs.</li>
</ul>
In the layer object, add a field <b>calculatedTags</b>, e.g.:

<div class="code">
  "calculatedTags": {
    "_someKey": "javascript-expression",
    "name": "feat.properties.name ?? feat.properties.ref ?? feat.properties.operator",
    "_distanceCloserThen3Km": "feat.distanceTo( some_lon, some_lat) < 3 ? 'yes' : 'no'" 
  }
</div>
`
}