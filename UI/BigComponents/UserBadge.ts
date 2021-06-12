/**
 * Handles and updates the user badge
 */
import {VariableUiElement} from "../Base/VariableUIElement";
import Svg from "../../Svg";
import State from "../../State";
import Combine from "../Base/Combine";
import {FixedUiElement} from "../Base/FixedUiElement";
import LanguagePicker from "../LanguagePicker";
import Translations from "../i18n/Translations";
import Link from "../Base/Link";
import Toggle from "../Input/Toggle";
import Img from "../Base/Img";

export default class UserBadge extends Toggle {

    constructor() {


        const userDetails = State.state.osmConnection.userDetails;

        const loginButton = Translations.t.general.loginWithOpenStreetMap
            .Clone()
            .SetClass("userbadge-login pt-3 w-full")
            .onClick(() => State.state.osmConnection.AttemptLogin());


        const logout =
            Svg.logout_svg()
                .onClick(() => {
                    State.state.osmConnection.LogOut();
                });


        const userBadge = userDetails.map(user => {
            {
                const homeButton = new VariableUiElement(
                    userDetails.map((userinfo) => {
                        if (userinfo.home) {
                            return Svg.home_ui();
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

                const linkStyle = "flex items-baseline"
                const languagePicker = (LanguagePicker.CreateLanguagePicker(State.state.layoutToUse.data.language) ?? new FixedUiElement(""))
                    .SetStyle("width:min-content;");

                let messageSpan =
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

                let dryrun = new FixedUiElement("");
                if (user.dryRun) {
                    dryrun = new FixedUiElement("TESTING").SetClass("alert");
                }

                const settings =
                    new Link(Svg.gear_svg(),
                        `https://www.openstreetmap.org/user/${encodeURIComponent(user.name)}/account`,
                        true)


                const userIcon = new Link(
                    new Img(user.img)
                        .SetClass("rounded-full opacity-0 m-0 p-0 duration-500 w-16 h16 float-left")
                    ,
                    `https://www.openstreetmap.org/user/${encodeURIComponent(user.name)}`,
                    true
                );


                const userName = new Link(
                    new FixedUiElement(user.name),
                    `https://www.openstreetmap.org/user/${user.name}`,
                    true);


                const userStats = new Combine([
                    homeButton,
                    settings,
                    messageSpan,
                    csCount,
                    languagePicker,
                    logout
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
                ]).SetClass("h-16")
            }
        });

        super(
            new VariableUiElement(userBadge),
            loginButton,
            State.state.osmConnection.isLoggedIn
        )

    }


}