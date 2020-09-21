import {UIElement} from "./UIElement";
import L from "leaflet";
import {FixedUiElement} from "./Base/FixedUiElement";
import {VariableUiElement} from "./Base/VariableUIElement";
import Translations from "./i18n/Translations";
import {UserDetails} from "../Logic/Osm/OsmConnection";
import {State} from "../State";
import {UIEventSource} from "../Logic/UIEventSource";
import {InitUiElements} from "../InitUiElements";
import Combine from "./Base/Combine";

/**
 * Handles and updates the user badge
 */
export class UserBadge extends UIElement {
    private _userDetails: UIEventSource<UserDetails>;
    private _logout: UIElement;
    private _homeButton: UIElement;
    private _languagePicker: UIElement;

    private _loginButton : UIElement;

    constructor() {
        super(State.state.osmConnection.userDetails);
        this._userDetails = State.state.osmConnection.userDetails;
        this._languagePicker = (InitUiElements.CreateLanguagePicker() ?? new FixedUiElement(""))
            .SetStyle("display:inline-block;width:min-content;");
        
        this._loginButton = Translations.t.general.loginWithOpenStreetMap
            .Clone()
            .SetClass("userbadge-login")
            .onClick(() => State.state.osmConnection.AttemptLogin());
        this._logout = new FixedUiElement("<img src='assets/logout.svg' class='small-userbadge-icon' alt='logout'>")
            .onClick(() => {
                State.state.osmConnection.LogOut();
            });

        this._userDetails.addCallback(function () {
            const profilePic = document.getElementById("profile-pic");
            if (profilePic) {

                profilePic.onload = function () {
                    profilePic.style.opacity = "1"
                };
            }
        });

        this._homeButton = new VariableUiElement(
            this._userDetails.map((userinfo) => {
                if (userinfo.home) {
                    return "<img src='./assets/home.svg' alt='home' class='small-userbadge-icon'> ";
                }
                return "";
            })
        ).onClick(() => {
            const home = State.state.osmConnection.userDetails.data?.home;
            if (home === undefined) {
                return;
            }
            State.state.bm.map.flyTo([home.lat, home.lon], 18);
        });

    }

    InnerRender(): string {
        const user = this._userDetails.data;
        if (!user.loggedIn) {
            return this._loginButton.Render();
        }
        
        
        let messageSpan = "<span id='messages'>" +
            "     <a href='https://www.openstreetmap.org/messages/inbox' target='_blank'><img class='small-userbadge-icon' src='./assets/envelope.svg' alt='msgs'>" +
            user.totalMessages +
            "</a></span>";

        if (user.unreadMessages > 0) {
            messageSpan = "<span id='messages' class='alert'>" +
                "<a href='https://www.openstreetmap.org/messages/inbox' target='_blank'><img class='small-userbadge-icon' src='./assets/envelope.svg' alt='msgs'/>" +
                user.unreadMessages.toString() +
                "</a></span>";
        }

        let dryrun = "";
        if (user.dryRun) {
            dryrun = " <span class='alert'>TESTING</span>";
        }

        if (user.home !== undefined) {
            const icon = L.icon({
                iconUrl: 'assets/home.svg',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            L.marker([user.home.lat, user.home.lon], {icon: icon}).addTo(State.state.bm.map);
        }

        const settings =
            "<a href='https://www.openstreetmap.org/user/" + encodeURIComponent(user.name) + "/account' target='_blank'>" +
            "<img class='small-userbadge-icon' src='./assets/gear.svg' alt='settings'>" +
            "</a> ";

        const userIcon = "<a href='https://www.openstreetmap.org/user/" + encodeURIComponent(user.name) + "' target='_blank'><img id='profile-pic' src='" + user.img + "' alt='profile-pic'/></a>";


        const userName = "<p id='username'>" +
            "<a href='https://www.openstreetmap.org/user/" + user.name + "' target='_blank'>" + user.name + "</a>" +
            dryrun + "</p>";

        const csCount = "<span id='csCount'> " +
            "   <a href='https://www.openstreetmap.org/user/" + user.name + "/history' target='_blank'><img class='small-userbadge-icon' src='./assets/star.svg' alt='star'/> " + user.csCount +
            "</a></span> ";

        const userStats = new Combine(["<div id='userstats'>",
            this._homeButton,
            settings,
            messageSpan,
            csCount,
            this._logout,
            this._languagePicker,
            "</div>"]).Render();

        return userIcon + "<div id='usertext'>" + userName + userStats + "</div>";

    }


}