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
        const toConfirm = [
            new Link(t.readImportGuidelines, "https://wiki.openstreetmap.org/wiki/Import_guidelines", true),
            t.contactedCommunity,
            t.licenseIsCompatible,
            t.wikipageIsMade
        ];

        super([
            new Title(t.titleLong),
            new CheckBoxes(toConfirm),
        ]);
        this.SetClass("link-underline")
        this.IsValid = new CheckBoxes(toConfirm).GetValue().map(selected => toConfirm.length == selected.length)
        this.Value = new UIEventSource<{ features: any[], theme: string }>(v)
    }
}