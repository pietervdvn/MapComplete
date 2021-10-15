import ThemeIntroductionPanel from "./ThemeIntroductionPanel";
import Svg from "../../Svg";
import Translations from "../i18n/Translations";
import ShareScreen from "./ShareScreen";
import MoreScreen from "./MoreScreen";
import Constants from "../../Models/Constants";
import Combine from "../Base/Combine";
import {TabbedComponent} from "../Base/TabbedComponent";
import {UIEventSource} from "../../Logic/UIEventSource";
import UserDetails, {OsmConnection} from "../../Logic/Osm/OsmConnection";
import ScrollableFullScreen from "../Base/ScrollableFullScreen";
import BaseUIElement from "../BaseUIElement";
import Toggle from "../Input/Toggle";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import {Utils} from "../../Utils";
import UserRelatedState from "../../Logic/State/UserRelatedState";

export default class FullWelcomePaneWithTabs extends ScrollableFullScreen {


    constructor(isShown: UIEventSource<boolean>,
                currentTab: UIEventSource<number>,
                state: {
                    layoutToUse: LayoutConfig,
                    osmConnection: OsmConnection,
                    featureSwitchShareScreen: UIEventSource<boolean>,
                    featureSwitchMoreQuests: UIEventSource<boolean>
                } & UserRelatedState) {
        const layoutToUse = state.layoutToUse;
        super(
            () => layoutToUse.title.Clone(),
            () => FullWelcomePaneWithTabs.GenerateContents(state, currentTab, isShown),
            undefined, isShown
        )
    }

    private static ConstructBaseTabs(state: {
                                         layoutToUse: LayoutConfig,
                                         osmConnection: OsmConnection,
                                         featureSwitchShareScreen: UIEventSource<boolean>,
                                         featureSwitchMoreQuests: UIEventSource<boolean>
                                     } & UserRelatedState,
                                     isShown: UIEventSource<boolean>):
        { header: string | BaseUIElement; content: BaseUIElement }[] {

        let welcome: BaseUIElement = new ThemeIntroductionPanel(isShown);

        const tabs: { header: string | BaseUIElement, content: BaseUIElement }[] = [
            {header: `<img src='${state.layoutToUse.icon}'>`, content: welcome},
            {
                header: Svg.osm_logo_img,
                content: Translations.t.general.openStreetMapIntro.Clone().SetClass("link-underline")
            },

        ]

        if (state.featureSwitchShareScreen.data) {
            tabs.push({header: Svg.share_img, content: new ShareScreen()});
        }

        if (state.featureSwitchMoreQuests.data) {

            tabs.push({
                header: Svg.add_img,
                content: new MoreScreen(state)
            });
        }

        return tabs;
    }

    private static GenerateContents(state: {
        layoutToUse: LayoutConfig,
        osmConnection: OsmConnection,
        featureSwitchShareScreen: UIEventSource<boolean>,
        featureSwitchMoreQuests: UIEventSource<boolean>
    } & UserRelatedState, currentTab: UIEventSource<number>, isShown: UIEventSource<boolean>) {

        const tabs = FullWelcomePaneWithTabs.ConstructBaseTabs(state, isShown)
        const tabsWithAboutMc = [...FullWelcomePaneWithTabs.ConstructBaseTabs(state, isShown)]

        const now = new Date()
        const lastWeek = new Date(now.getDate() - 7 * 24 * 60 * 60 * 1000)
        const date = lastWeek.getFullYear() + "-" + Utils.TwoDigits(lastWeek.getMonth() + 1) + "-" + Utils.TwoDigits(lastWeek.getDate())
        const osmcha_link = `https://osmcha.org/?filters=%7B%22date__gte%22%3A%5B%7B%22label%22%3A%22${date}%22%2C%22value%22%3A%222021-01-01%22%7D%5D%2C%22editor%22%3A%5B%7B%22label%22%3A%22mapcomplete%22%2C%22value%22%3A%22mapcomplete%22%7D%5D%7D`

        tabsWithAboutMc.push({
                header: Svg.help,
                content: new Combine([Translations.t.general.aboutMapcomplete.Clone()
                    .Subs({"osmcha_link": osmcha_link}), "<br/>Version " + Constants.vNumber])
                    .SetClass("link-underline")
            }
        );

        tabs.forEach(c => c.content.SetClass("p-4"))
        tabsWithAboutMc.forEach(c => c.content.SetClass("p-4"))

        return new Toggle(
            new TabbedComponent(tabsWithAboutMc, currentTab),
            new TabbedComponent(tabs, currentTab),
            state.osmConnection.userDetails.map((userdetails: UserDetails) =>
                userdetails.loggedIn &&
                userdetails.csCount >= Constants.userJourney.mapCompleteHelpUnlock)
        )
    }

}