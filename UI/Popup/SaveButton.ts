import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import Translations from "../i18n/Translations";
import {OsmConnection} from "../../Logic/Osm/OsmConnection";
import BaseUIElement from "../BaseUIElement";
import Toggle from "../Input/Toggle";

export class SaveButton extends UIElement {


    private readonly _element: BaseUIElement;

    constructor(value: UIEventSource<any>, osmConnection: OsmConnection) {
        super(value);
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
        this._element = new Toggle(
            save
            , pleaseLogin,
            osmConnection?.userDetails?.map(userDetails => userDetails.loggedIn) ?? new UIEventSource<any>(false)
        )

    }

    InnerRender(): BaseUIElement {
        return this._element

    }

}