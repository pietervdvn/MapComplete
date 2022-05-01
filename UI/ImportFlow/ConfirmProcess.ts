import Combine from "../Base/Combine";
import {FlowStep} from "./FlowStep";
import {UIEventSource} from "../../Logic/UIEventSource";
import Link from "../Base/Link";
import CheckBoxes from "../Input/Checkboxes";
import Title from "../Base/Title";
import Translations from "../i18n/Translations";

export class ConfirmProcess extends Combine implements FlowStep<{ features: any[], theme: string }> {

    public IsValid: UIEventSource<boolean>
    public Value: UIEventSource<{ features: any[], theme: string }>

    constructor(v: { features: any[], theme: string }) {
        const t = Translations.t.importHelper.confirmProcess;
        const elements = [
            new Link(t.readImportGuidelines, "https://wiki.openstreetmap.org/wiki/Import_guidelines", true),
            t.contactedCommunity,
            t.licenseIsCompatible,
            t.wikipageIsMade
        ]
        const toConfirm = new CheckBoxes(elements);

        super([
            new Title(t.titleLong),
            toConfirm,
        ]);
        this.SetClass("link-underline")
        this.IsValid = toConfirm.GetValue().map(selected => elements.length == selected.length)
        this.Value = new UIEventSource<{ features: any[], theme: string }>(v)
    }
}