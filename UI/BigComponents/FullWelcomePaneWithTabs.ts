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
            isShown
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
                content:
                new Combine([
                    Translations.t.general.morescreen.intro.Clone(),
                    new MoreScreen(state)
                ]).SetClass("flex flex-col")
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

       
        tabsWithAboutMc.push({
                header: Svg.help,
                content: new Combine([Translations.t.general.aboutMapcomplete.Clone()
                    .Subs({"osmcha_link": Utils.OsmChaLinkFor(7)}), "<br/>Version " + Constants.vNumber])
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