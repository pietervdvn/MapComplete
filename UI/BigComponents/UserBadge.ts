/**
 * Handles and updates the user badge
 */
import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import UserDetails from "../../Logic/Osm/OsmConnection";
import Svg from "../../Svg";
import State from "../../State";
import Combine from "../Base/Combine";
import {FixedUiElement} from "../Base/FixedUiElement";
import LanguagePicker from "../LanguagePicker";
import Translations from "../i18n/Translations";
import Link from "../Base/Link";

export default class UserBadge extends UIElement {
    private _userDetails: UIEventSource<UserDetails>;
    private _logout: UIElement;
    private _homeButton: UIElement;
    private _languagePicker: UIElement;

    private _loginButton: UIElement;

    constructor() {
        super(State.state.osmConnection.userDetails);
        this._userDetails = State.state.osmConnection.userDetails;
        this._languagePicker = (LanguagePicker.CreateLanguagePicker(State.state.layoutToUse.data.language) ?? new FixedUiElement(""))
            .SetStyle("width:min-content;");

        this._loginButton = Translations.t.general.loginWithOpenStreetMap
            .Clone()
            .SetClass("userbadge-login pt-3 w-full")
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
                    return Svg.home_ui().Render();
                }
                return " ";
            })
        ).onClick(() => {
            const home = State.state.osmConnection.userDetails.data?.home;
            if (home === undefined) {
                return;
            }
            State.state.leafletMap.data.setView([home.lat, home.lon], 16);
        });

    }

    InnerRender(): string {
        const user = this._userDetails.data;
        if (!user.loggedIn) {
            return this._loginButton.Render();
        }

        const linkStyle = "flex items-baseline"

        let messageSpan: UIElement =
            new Link(
                new Combine([Svg.envelope, "" + user.totalMessages]).SetClass(linkStyle),
                'https://www.openstreetmap.org/messages/inbox',
                true
            )


        const csCount =
            new Link(
                new Combine([Svg.star, "" + user.csCount]).SetClass(linkStyle),
                `https://www.openstreetmap.org/user/${user.name}/history`,
                true);


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
            `https://www.openstreetmap.org/user/${user.name}`,
            true);


        const userStats = new Combine([
            this._homeButton,
            settings,
            messageSpan,
            csCount,
            this._languagePicker,
            this._logout
        ])
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