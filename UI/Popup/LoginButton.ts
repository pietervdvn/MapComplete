import {SubtleButton} from "../Base/SubtleButton";
import BaseUIElement from "../BaseUIElement";
import Svg from "../../Svg";
import {OsmConnection} from "../../Logic/Osm/OsmConnection";
import Toggle from "../Input/Toggle";
import {VariableUiElement} from "../Base/VariableUIElement";
import Loading from "../Base/Loading";
import Translations from "../i18n/Translations";

class LoginButton extends SubtleButton {

    constructor(text: BaseUIElement | string, state: {
        osmConnection: OsmConnection
    }, icon?: BaseUIElement | string) {
        super(icon ?? Svg.osm_logo_ui(), text);
        this.onClick(() => {
            state.osmConnection.AttemptLogin()
        })
    }

}

export class LoginToggle extends VariableUiElement {
    constructor(el, text: BaseUIElement | string, state: {
        osmConnection: OsmConnection
    }) {
        const loading = new Loading("Trying to log in...")
        const login = new LoginButton(text, state)
        super(
            state.osmConnection.loadingStatus.map(osmConnectionState => {
                console.trace("Current osm state is ", osmConnectionState)
                if(osmConnectionState === "loading"){
                    return loading
                }
                if(osmConnectionState === "not-attempted"){
                    return login
                }
                if(osmConnectionState === "logged-in"){
                   return el
                }
                
                // Error!
                return new LoginButton(Translations.t.general.loginFailed, state, Svg.invalid_svg())
            })
            )
    }
}