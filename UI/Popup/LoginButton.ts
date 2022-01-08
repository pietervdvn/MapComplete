import {SubtleButton} from "../Base/SubtleButton";
import BaseUIElement from "../BaseUIElement";
import Svg from "../../Svg";
import {OsmConnection} from "../../Logic/Osm/OsmConnection";
import Toggle from "../Input/Toggle";

export default class LoginButton extends SubtleButton {

    constructor(text: BaseUIElement | string, state: {
        osmConnection: OsmConnection
    }) {
        super(Svg.osm_logo_svg(), text);
        this.onClick(() => {
            state.osmConnection.AttemptLogin()
        })
    }

}

export class LoginToggle extends Toggle {
    constructor(el, text: BaseUIElement | string, state: {
        osmConnection: OsmConnection
    }) {
        super(el, new LoginButton(text, state), state.osmConnection.isLoggedIn)
    }
}