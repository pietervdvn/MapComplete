import {UIElement} from "./UIElement";
import * as L from "leaflet";
import {FixedUiElement} from "./Base/FixedUiElement";
import {VariableUiElement} from "./Base/VariableUIElement";
import Translations from "./i18n/Translations";
import {UserDetails} from "../Logic/Osm/OsmConnection";
import State from "../State";
import {UIEventSource} from "../Logic/UIEventSource";
import Combine from "./Base/Combine";
import Svg from "../Svg";
import Link from "./Base/Link";
import {Img} from "./Img";
import LanguagePicker from "./LanguagePicker";

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
        this._languagePicker = (LanguagePicker.CreateLanguagePicker(State.state.layoutToUse.data.language) ?? new FixedUiElement(""))
            .SetStyle("display:inline-block;width:min-content;");

        this._loginButton = Translations.t.general.loginWithOpenStreetMap
            .Clone()
            .SetClass("userbadge-login")
            .onClick(() => State.state.osmConnection.AttemptLogin());
        this._logout =
            Svg.logout_svg()
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
                    return Svg.home;
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


        let messageSpan: UIElement =
            new Link(
                new Combine([Svg.envelope, "" + user.totalMessages]),
                'https://www.openstreetmap.org/messages/inbox',
                true
            )


        if (user.unreadMessages > 0) {
            messageSpan = new Link(
                new Combine([Svg.envelope, "" + user.unreadMessages]),
                'https://www.openstreetmap.org/messages/inbox',
                true
            ).SetClass("alert")
        }

        let dryrun: UIElement = new FixedUiElement("");
        if (user.dryRun) {
            dryrun = new FixedUiElement("TESTING").SetClass("alert");
        }

        if (user.home !== undefined) {
            const icon = L.icon({
                iconUrl: Img.AsData(Svg.home),
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            L.marker([user.home.lat, user.home.lon], {icon: icon}).addTo(State.state.bm.map);
        }

        const settings =
            new Link(Svg.gear_svg(),
                `https://www.openstreetmap.org/user/${encodeURIComponent(user.name)}/account`, 
                true)


        const userIcon = new Link(
            new FixedUiElement(`<img id='profile-pic' src='${user.img}' alt='profile-pic'/>`),
            `https://www.openstreetmap.org/user/${encodeURIComponent(user.name)}`,
            true
        );


        const userName = new Link(
            new FixedUiElement(user.name),
            `https://www.openstreetmap.org/user/${user.name}'`,
            true);


        const csCount =
            new Link(
                new Combine([Svg.star, "" + user.csCount]),
                `https://www.openstreetmap.org/user/${user.name}/history`,
                true);


        const userStats = new Combine([
            this._homeButton,
            settings,
            messageSpan,
            csCount,
            this._logout,
            this._languagePicker])
            .SetClass("userstats")

        const usertext = new Combine([
            userName,
            dryrun,
            userStats
        ]).SetClass("usertext")

        return new Combine([
            userIcon,
            usertext,
        ]).Render()

    }


}