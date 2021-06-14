import State from "../../State";
import ThemeIntroductionPanel from "./ThemeIntroductionPanel";
import * as personal from "../../assets/themes/personalLayout/personalLayout.json";
import PersonalLayersPanel from "./PersonalLayersPanel";
import Svg from "../../Svg";
import Translations from "../i18n/Translations";
import ShareScreen from "./ShareScreen";
import MoreScreen from "./MoreScreen";
import Constants from "../../Models/Constants";
import Combine from "../Base/Combine";
import {TabbedComponent} from "../Base/TabbedComponent";
import {UIEventSource} from "../../Logic/UIEventSource";
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";
import UserDetails from "../../Logic/Osm/OsmConnection";
import ScrollableFullScreen from "../Base/ScrollableFullScreen";
import BaseUIElement from "../BaseUIElement";
import Toggle from "../Input/Toggle";

export default class FullWelcomePaneWithTabs extends ScrollableFullScreen {


    constructor(isShown: UIEventSource<boolean>) {
        const layoutToUse = State.state.layoutToUse.data;
        super (
            () => layoutToUse.title.Clone(),
            () => FullWelcomePaneWithTabs.GenerateContents(layoutToUse, State.state.osmConnection.userDetails),
            "welcome" ,isShown
        )
    }

    private static GenerateContents(layoutToUse: LayoutConfig, userDetails: UIEventSource<UserDetails>) {

        let welcome: BaseUIElement = new ThemeIntroductionPanel();
        if (layoutToUse.id === personal.id) {
            welcome = new PersonalLayersPanel();
        }
        const tabs: { header: string | BaseUIElement, content: BaseUIElement }[] = [
            {header: `<img src='${layoutToUse.icon}'>`, content: welcome},
            {
                header: Svg.osm_logo_img,
                content: Translations.t.general.openStreetMapIntro.Clone().SetClass("link-underline")
            },

        ]

        if (State.state.featureSwitchShareScreen.data) {
            tabs.push({header: Svg.share_img, content: new ShareScreen()});
        }

        if (State.state.featureSwitchMoreQuests.data) {

            tabs.push({
                header: Svg.add_img,
                content: new MoreScreen()
            });
        }


        const tabsWithAboutMc = [...tabs]
        tabsWithAboutMc.push({
                header: Svg.help,
                content: new Combine([Translations.t.general.aboutMapcomplete.Clone(), "<br/>Version " + Constants.vNumber])
                    .SetClass("link-underline")
            }
        );

        return new Toggle(
            new TabbedComponent(tabsWithAboutMc, State.state.welcomeMessageOpenedTab),
            new TabbedComponent(tabs, State.state.welcomeMessageOpenedTab),
            userDetails.map(userdetails =>
                userdetails.csCount < Constants.userJourney.mapCompleteHelpUnlock)
        )
    }

}