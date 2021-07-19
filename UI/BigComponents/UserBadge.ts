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
            .SetClass("userbadge-login pt-3 w-full h-full")
            .onClick(() => State.state.osmConnection.AttemptLogin());


        const logout =
            Svg.logout_svg()
                .onClick(() => {
                    State.state.osmConnection.LogOut();
                });


        const userBadge = new VariableUiElement(userDetails.map(user => {
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
                        `${user.backend}/messages/inbox`,
                        true
                    )


                const csCount =
                    new Link(
                        new Combine([Svg.star, "" + user.csCount]).SetClass(linkStyle),
                        `${user.backend}/user/${user.name}/history`,
                        true);


                if (user.unreadMessages > 0) {
                    messageSpan = new Link(
                        new Combine([Svg.envelope, "" + user.unreadMessages]),
                        `${user.backend}/messages/inbox`,
                        true
                    ).SetClass("alert")
                }

                let dryrun = new FixedUiElement("");
                if (user.dryRun) {
                    dryrun = new FixedUiElement("TESTING").SetClass("alert font-xs p-0 max-h-4");
                }

                const settings =
                    new Link(Svg.gear_svg(),
                        `${user.backend}/user/${encodeURIComponent(user.name)}/account`,
                        true)


                const userName = new Link(
                    new FixedUiElement(user.name),
                    `${user.backend}/user/${user.name}`,
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
                    new Combine([userName, dryrun]).SetClass("flex justify-end w-full"),
                    userStats
                ]).SetClass("flex flex-col sm:w-auto sm:pl-2 overflow-hidden w-0")
                const userIcon =
                    (user.img === undefined ? Svg.osm_logo_ui() :   new Img(user.img)).SetClass("rounded-full opacity-0 m-0 p-0 duration-500 w-16 min-width-16 h16 float-left")
                        .onClick(() => {
                            if(usertext.HasClass("w-0")){
                                usertext.RemoveClass("w-0")
                                usertext.SetClass("w-min pl-2")
                            }else{
                                usertext.RemoveClass("w-min")
                                usertext.RemoveClass("pl-2")
                                usertext.SetClass("w-0")
                            }
                        })

                return new Combine([
                    usertext,
                    userIcon,
                ]).SetClass("h-16 flex bg-white")
                
            }
        }));

        userBadge.SetClass("inline-block m-0 w-full").SetStyle("pointer-events: all")
        super(
            userBadge,
            loginButton,
            State.state.osmConnection.isLoggedIn
        )

        
       this.SetClass("shadow rounded-full h-min overflow-hidden block w-max")
        
    }


}