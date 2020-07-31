import {UIElement} from "./UIElement";
import {UIEventSource} from "./UIEventSource";
import L from "leaflet";
import {FixedUiElement} from "./Base/FixedUiElement";
import {VariableUiElement} from "./Base/VariableUIElement";
import Translations from "./i18n/Translations";
import {UserDetails} from "../Logic/Osm/OsmConnection";
import {Basemap} from "../Logic/Leaflet/Basemap";
import {State} from "../State";
import {PendingChanges} from "./PendingChanges";
import Locale from "./i18n/Locale";
import {Utils} from "../Utils";

/**
 * Handles and updates the user badge
 */
export class UserBadge extends UIElement {
    private _userDetails: UIEventSource<UserDetails>;
    private _pendingChanges: UIElement;
    private _logout: UIElement;
    private _homeButton: UIElement;
    private _languagePicker: UIElement;


    constructor() {
        super(State.state.osmConnection.userDetails);
        this._userDetails = State.state.osmConnection.userDetails;
        this._pendingChanges = new PendingChanges();
        this._languagePicker = Utils.CreateLanguagePicker();

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
                    return "<img id='home' src='./assets/home.svg' alt='home' class='small-userbadge-icon'> ";
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
            return "<div class='activate-osm-authentication'>" + Translations.t.general.loginWithOpenStreetMap.R()+ "</div>";
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

        const userStats = "<div id='userstats'>" +
            this._homeButton.Render() +
            settings +
            messageSpan +
            csCount +
            this._logout.Render() +
            this._pendingChanges.Render() +
            this._languagePicker.Render() +
            "</div>";

        return userIcon + "<div id='usertext'>" + userName + userStats + "</div>";

    }


}