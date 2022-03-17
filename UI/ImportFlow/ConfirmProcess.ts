import Combine from "../Base/Combine";
import {FlowStep} from "./FlowStep";
import {UIEventSource} from "../../Logic/UIEventSource";
import Link from "../Base/Link";
import {FixedUiElement} from "../Base/FixedUiElement";
import CheckBoxes from "../Input/Checkboxes";
import Title from "../Base/Title";
import {SubtleButton} from "../Base/SubtleButton";
import Svg from "../../Svg";
import {Utils} from "../../Utils";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";

export class ConfirmProcess extends Combine implements FlowStep<{ features: any[], layer: LayerConfig }> {

    public IsValid: UIEventSource<boolean>
    public Value: UIEventSource<{ features: any[], layer: LayerConfig }>

    constructor(v: { features: any[], layer: LayerConfig }) {

        const toConfirm = [
            new Combine(["I have read the ", new Link("import guidelines on the OSM wiki", "https://wiki.openstreetmap.org/wiki/Import_guidelines", true)]),
            new FixedUiElement("I did contact the (local) community about this import"),
            new FixedUiElement("The license of the data to import allows it to be imported into OSM. They are allowed to be redistributed commercially, with only minimal attribution"),
            new FixedUiElement("The process is documented on the OSM-wiki (you'll need this link later)")
        ];

        const licenseClear = new CheckBoxes(toConfirm)
        super([
            new Title("Did you go through the import process?"),
            licenseClear,
            new FixedUiElement("Alternatively, you can download the dataset to import directly"),
            new SubtleButton(Svg.download_svg(), "Download geojson").OnClickWithLoading("Preparing your download", 
                async ( ) => {
                const geojson = {
                    type:"FeatureCollection",
                    features: v.features
                }
                Utils.offerContentsAsDownloadableFile(JSON.stringify(geojson), "prepared_import_"+v.layer.id+".geojson",{
                    mimetype: "application/vnd.geo+json"
                })
            })
        ]);
        this.SetClass("link-underline")
        this.IsValid = licenseClear.GetValue().map(selected => toConfirm.length == selected.length)
        this.Value = new UIEventSource<{ features: any[], layer: LayerConfig }>(v)
    }
}