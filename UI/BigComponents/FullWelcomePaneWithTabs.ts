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
import Loc from "../../Models/Loc";
import BaseLayer from "../../Models/BaseLayer";
import FilteredLayer from "../../Models/FilteredLayer";
import CopyrightPanel from "./CopyrightPanel";
import FeaturePipeline from "../../Logic/FeatureSource/FeaturePipeline";
import PrivacyPolicy from "./PrivacyPolicy";

export default class FullWelcomePaneWithTabs extends ScrollableFullScreen {


    constructor(isShown: UIEventSource<boolean>,
                currentTab: UIEventSource<number>,
                state: {
                    layoutToUse: LayoutConfig,
                    osmConnection: OsmConnection,
                    featureSwitchShareScreen: UIEventSource<boolean>,
                    featureSwitchMoreQuests: UIEventSource<boolean>,
                    locationControl: UIEventSource<Loc>,
                    featurePipeline: FeaturePipeline,
                    backgroundLayer: UIEventSource<BaseLayer>,
                    filteredLayers: UIEventSource<FilteredLayer[]>
                } & UserRelatedState) {
        const layoutToUse = state.layoutToUse;
        super(
            () => layoutToUse.title.Clone(),
            () => FullWelcomePaneWithTabs.GenerateContents(state, currentTab, isShown),
            "welcome",
            isShown
        )
    }

    private static ConstructBaseTabs(state: {
                                         layoutToUse: LayoutConfig,
                                         osmConnection: OsmConnection,
                                         featureSwitchShareScreen: UIEventSource<boolean>,
                                         featureSwitchMoreQuests: UIEventSource<boolean>,
                                         featurePipeline: FeaturePipeline,
                                         locationControl: UIEventSource<Loc>, backgroundLayer: UIEventSource<BaseLayer>, filteredLayers: UIEventSource<FilteredLayer[]>
                                     } & UserRelatedState,
                                     isShown: UIEventSource<boolean>):
        { header: string | BaseUIElement; content: BaseUIElement }[] {

        let welcome: BaseUIElement = new ThemeIntroductionPanel(isShown);

        const tabs: { header: string | BaseUIElement, content: BaseUIElement }[] = [
            {header: `<img src='${state.layoutToUse.icon}'>`, content: welcome},
        ]


        if (state.featureSwitchMoreQuests.data) {
            tabs.push({
                header: Svg.add_img,
                content:
                    new Combine([
                        Translations.t.general.morescreen.intro,
                        new MoreScreen(state)
                    ]).SetClass("flex flex-col")
            });
        }


        if (state.featureSwitchShareScreen.data) {
            tabs.push({header: Svg.share_img, content: new ShareScreen(state)});
        }

        const copyright = {
            header: Svg.copyright_svg(),
            content:
                new Combine(
                    [
                        Translations.t.general.openStreetMapIntro.SetClass("link-underline"),
                        Translations.t.general.attribution.attributionTitle,
                        new CopyrightPanel(state)

                    ]
                )
        }
        tabs.push(copyright)
        
        const privacy = {
            header: Svg.eye_svg(),
            content: new PrivacyPolicy()
        }
        tabs.push(privacy)

        return tabs;
    }

    private static GenerateContents(state: {
        layoutToUse: LayoutConfig,
        osmConnection: OsmConnection,
        featureSwitchShareScreen: UIEventSource<boolean>,
        featureSwitchMoreQuests: UIEventSource<boolean>,
        featurePipeline: FeaturePipeline,
        locationControl: UIEventSource<Loc>, backgroundLayer: UIEventSource<BaseLayer>, filteredLayers: UIEventSource<FilteredLayer[]>
    } & UserRelatedState, currentTab: UIEventSource<number>, isShown: UIEventSource<boolean>) {

        const tabs = FullWelcomePaneWithTabs.ConstructBaseTabs(state, isShown)
        const tabsWithAboutMc = [...FullWelcomePaneWithTabs.ConstructBaseTabs(state, isShown)]


        tabsWithAboutMc.push({
                header: Svg.help,
                content: new Combine([Translations.t.general.aboutMapcomplete
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