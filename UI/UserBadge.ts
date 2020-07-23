import {UIElement} from "./UIElement";
import {UserDetails} from "../Logic/OsmConnection";
import {UIEventSource} from "./UIEventSource";
import {Basemap} from "../Logic/Basemap";
import L from "leaflet";
import {FixedUiElement} from "./Base/FixedUiElement";
import {VariableUiElement} from "./Base/VariableUIElement";
import Translations from "./i18n/Translations";

/**
 * Handles and updates the user badge
 */
export class UserBadge extends UIElement {
    private _userDetails: UIEventSource<UserDetails>;
    private _pendingChanges: UIElement;
    private _logout: UIElement;
    private _basemap: Basemap;
    private _homeButton: UIElement;
    private _languagePicker: UIElement;


    constructor(userDetails: UIEventSource<UserDetails>,
                pendingChanges: UIElement,
                languagePicker: UIElement,
                basemap: Basemap) {
        super(userDetails);
        this._userDetails = userDetails;
        this._pendingChanges = pendingChanges;
        this._basemap = basemap;
        this._languagePicker = languagePicker;

        this._logout = new FixedUiElement("<img src='assets/logout.svg' class='small-userbadge-icon' alt='logout'>")
            .onClick(() => {
                userDetails.data.osmConnection.LogOut();
            });

        userDetails.addCallback(function () {
            const profilePic = document.getElementById("profile-pic");
            if (profilePic) {

                profilePic.onload = function () {
                    profilePic.style.opacity = "1"
                };
            }
        });

        this._homeButton = new VariableUiElement(
            userDetails.map((userinfo) => {
                if (userinfo.home) {
                    return "<img id='home' src='./assets/home.svg' alt='home' class='small-userbadge-icon'> ";
                }
                return "";
            })
        ).onClick(() => {
            const home = userDetails.data?.home;
            if (home === undefined) {
                return;
            }
            basemap.map.flyTo([home.lat, home.lon], 18);
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
            L.marker([user.home.lat, user.home.lon], {icon: icon}).addTo(this._basemap.map);
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