import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import Translations from "../i18n/Translations";
import UserDetails, {OsmConnection} from "../../Logic/Osm/OsmConnection";

export class SaveButton extends UIElement {

    private readonly _value: UIEventSource<any>;
    private readonly _friendlyLogin: UIElement;
    private readonly _userDetails: UIEventSource<UserDetails>;

    constructor(value: UIEventSource<any>, osmConnection: OsmConnection) {
        super(value);
        this._userDetails = osmConnection?.userDetails;
        if(value === undefined){
            throw "No event source for savebutton, something is wrong"
        }
        this._value = value;
        this._friendlyLogin = Translations.t.general.loginToStart.Clone()
            .SetClass("login-button-friendly")
            .onClick(() => osmConnection?.AttemptLogin())
    }

    InnerRender(): string {
        if(this._userDetails != undefined &&  !this._userDetails.data.loggedIn){
            return this._friendlyLogin.Render();
        }
        let inactive_class = ''
        if (this._value.data === false || (this._value.data ?? "") === "") {
            inactive_class = "btn-disabled";
        }
        return Translations.t.general.save.Clone().SetClass(`btn ${inactive_class}`).Render();
    }

}