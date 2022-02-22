import Combine from "../Base/Combine";
import {FlowStep} from "./FlowStep";
import {UIEventSource} from "../../Logic/UIEventSource";
import Link from "../Base/Link";
import {FixedUiElement} from "../Base/FixedUiElement";
import CheckBoxes from "../Input/Checkboxes";
import Title from "../Base/Title";

export class ConfirmProcess<T> extends Combine implements FlowStep<T> {

    public IsValid: UIEventSource<boolean>
    public Value: UIEventSource<T>

    constructor(v: T) {

        const toConfirm = [
            new Combine(["I have read the ", new Link("import guidelines on the OSM wiki", "https://wiki.openstreetmap.org/wiki/Import_guidelines", true)]),
            new FixedUiElement("I did contact the (local) community about this import"),
            new FixedUiElement("The license of the data to import allows it to be imported into OSM. They are allowed to be redistributed commercially, with only minimal attribution"),
            new FixedUiElement("The process is documented on the OSM-wiki (you'll need this link later)")
        ];

        const licenseClear = new CheckBoxes(toConfirm)
        super([
            new Title("Did you go through the import process?"),
            licenseClear
        ]);
        this.SetClass("link-underline")
        this.IsValid = licenseClear.GetValue().map(selected => toConfirm.length == selected.length)
        this.Value = new UIEventSource<T>(v)
    }
}