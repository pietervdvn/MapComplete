import {DropDown} from "../Input/DropDown";
import Translations from "../i18n/Translations";
import {UIEventSource} from "../../Logic/UIEventSource";
import {OsmConnection} from "../../Logic/Osm/OsmConnection";

export default class LicensePicker extends DropDown<string> {

    constructor(state: {osmConnection: OsmConnection}) {
        super(Translations.t.image.willBePublished.Clone(),
            [
                {value: "CC0", shown: Translations.t.image.cco.Clone()},
                {value: "CC-BY-SA 4.0", shown: Translations.t.image.ccbs.Clone()},
                {value: "CC-BY 4.0", shown: Translations.t.image.ccb.Clone()}
            ],
            state?.osmConnection?.GetPreference("pictures-license") ?? new UIEventSource<string>("CC0")
        )
        this.SetClass("flex flex-col sm:flex-row").SetStyle("float:left");
    }

}