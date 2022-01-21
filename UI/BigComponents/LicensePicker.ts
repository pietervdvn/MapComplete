import {DropDown} from "../Input/DropDown";
import Translations from "../i18n/Translations";
import {UIEventSource} from "../../Logic/UIEventSource";
import {OsmConnection} from "../../Logic/Osm/OsmConnection";
import {Translation} from "../i18n/Translation";

export default class LicensePicker extends DropDown<string> {

    private static readonly cc0 = "CC0"
    private static readonly ccbysa = "CC-BY-SA 4.0"
    private static readonly ccby = "CC-BY 4.0"

    constructor(state: {osmConnection: OsmConnection}) {
        super(Translations.t.image.willBePublished.Clone(),
            [
                {value:LicensePicker. cc0, shown: Translations.t.image.cco.Clone()},
                {value:LicensePicker.  ccbysa, shown: Translations.t.image.ccbs.Clone()},
                {value: LicensePicker. ccby, shown: Translations.t.image.ccb.Clone()}
            ],
            state?.osmConnection?.GetPreference("pictures-license") ?? new UIEventSource<string>("CC0")
        )
        this.SetClass("flex flex-col sm:flex-row").SetStyle("float:left");
    }

    public static LicenseExplanations() : Map<string, Translation>{
        let dict = new Map<string, Translation>();
        
        dict.set(LicensePicker. cc0, Translations.t.image.ccoExplanation)
        dict.set(LicensePicker. ccby, Translations.t.image.ccbExplanation)
        dict.set(LicensePicker. ccbysa, Translations.t.image.ccbsExplanation)

        return dict
    }
    
}