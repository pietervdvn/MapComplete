import {DropDown} from "../Input/DropDown";
import Translations from "../i18n/Translations";
import State from "../../State";

export default class LicensePicker extends DropDown<string>{
    
    constructor() {
        super(Translations.t.image.willBePublished,
            [
                {value: "CC0", shown: Translations.t.image.cco},
                {value: "CC-BY-SA 4.0", shown: Translations.t.image.ccbs},
                {value: "CC-BY 4.0", shown: Translations.t.image.ccb}
            ],
            State.state.osmConnection.GetPreference("pictures-license")
        )
            this.SetClass("flex flex-col sm:flex-row").SetStyle("float:left");
    }
    
}