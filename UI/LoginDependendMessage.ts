import {UIElement} from "./UIElement";
import {UserDetails} from "../Logic/OsmConnection";
import {UIEventSource} from "./UIEventSource";

export class LoginDependendMessage extends UIElement {
    private _noLoginMsg: string;
    private _loginMsg: string;
    private _userDetails: UserDetails;

    constructor(loginData: UIEventSource<UserDetails>,
                noLoginMsg: string,
                loginMsg: string) {
        super(loginData);
        this._userDetails = loginData.data;
        this._noLoginMsg = noLoginMsg;
        this._loginMsg = loginMsg;
    }

    protected InnerRender(): string {
        if (this._userDetails.loggedIn) {
            return this._loginMsg;
        } else {
            return this._noLoginMsg;
        }
    }

    InnerUpdate(htmlElement: HTMLElement) {
        // pass
    }

}