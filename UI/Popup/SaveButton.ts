import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import Translations from "../i18n/Translations";
import State from "../../State";

export class SaveButton extends UIElement {

    private _value: UIEventSource<any>;
    private _friendlyLogin: UIElement;

    constructor(value: UIEventSource<any>) {
        super(value);
        if(value === undefined){
            throw "No event source for savebutton, something is wrong"
        }
        this._value = value;

        this._friendlyLogin = Translations.t.general.loginToStart.Clone()
            .SetClass("login-button-friendly")
            .onClick(() => State.state.osmConnection.AttemptLogin())
    }

    InnerRender(): string {
        let clss = "save";

        if(State.state !== undefined && !State.state.osmConnection.userDetails.data.loggedIn){
            return this._friendlyLogin.Render();
        }
        if ((this._value.data ?? "") === "") {
            clss = "save-non-active";
        }
        return Translations.t.general.save.Clone().SetClass(clss).Render();
    }

}