import {UIEventSource} from "../../Logic/UIEventSource";
import Translations from "../i18n/Translations";
import {OsmConnection} from "../../Logic/Osm/OsmConnection";
import Toggle from "../Input/Toggle";

export class SaveButton extends Toggle {

    constructor(value: UIEventSource<any>, osmConnection: OsmConnection) {
        if (value === undefined) {
            throw "No event source for savebutton, something is wrong"
        }

        const pleaseLogin = Translations.t.general.loginToStart.Clone()
            .SetClass("login-button-friendly")
            .onClick(() => osmConnection?.AttemptLogin())


        const isSaveable = value.map(v => v !== false && (v ?? "") !== "")


        const saveEnabled = Translations.t.general.save.Clone().SetClass(`btn`);
        const saveDisabled = Translations.t.general.save.Clone().SetClass(`btn btn-disabled`);
        const save = new Toggle(
            saveEnabled,
            saveDisabled,
            isSaveable
        )
        super(
            save, 
            pleaseLogin,
            osmConnection?.isLoggedIn ?? new UIEventSource<any>(false)
        )

    }

}