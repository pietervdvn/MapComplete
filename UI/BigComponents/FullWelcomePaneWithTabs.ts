import {UIElement} from "../UIElement";
import State from "../../State";
import ThemeIntroductionPanel from "./ThemeIntroductionPanel";
import * as personal from "../../assets/themes/personalLayout/personalLayout.json";
import PersonalLayersPanel from "./PersonalLayersPanel";
import Svg from "../../Svg";
import Translations from "../i18n/Translations";
import ShareScreen from "./ShareScreen";
import MoreScreen from "./MoreScreen";
import {VariableUiElement} from "../Base/VariableUIElement";
import Constants from "../../Models/Constants";
import Combine from "../Base/Combine";
import Locale from "../i18n/Locale";
import {TabbedComponent} from "../Base/TabbedComponent";
import {UIEventSource} from "../../Logic/UIEventSource";
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";
import UserDetails from "../../Logic/Osm/OsmConnection";
import ScrollableFullScreen from "../Base/ScrollableFullScreen";

export default class FullWelcomePaneWithTabs extends UIElement {
    private readonly _layoutToUse: UIEventSource<LayoutConfig>;
    private readonly _userDetails: UIEventSource<UserDetails>;

    private readonly _component: UIElement;

    constructor(isShown: UIEventSource<boolean>) {
        super(State.state.layoutToUse);
        this._layoutToUse = State.state.layoutToUse;
        this._userDetails = State.state.osmConnection.userDetails;
        const layoutToUse = this._layoutToUse.data;
      

        this._component = new ScrollableFullScreen(
            () => layoutToUse.title.Clone(),
            () => FullWelcomePaneWithTabs.GenerateContents(layoutToUse, State.state.osmConnection.userDetails),
            "welcome" ,isShown
        )
    }

    private static GenerateContents(layoutToUse: LayoutConfig, userDetails: UIEventSource<UserDetails>) {

        let welcome: UIElement = new ThemeIntroductionPanel();
        if (layoutToUse.id === personal.id) {
            welcome = new PersonalLayersPanel();
        }
        const tabs = [
            {header: `<img src='${layoutToUse.icon}'>`, content: welcome},
            {
                header: Svg.osm_logo_img,
                content: Translations.t.general.openStreetMapIntro.Clone().SetClass("link-underline") as UIElement
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


        tabs.push({
                header: Svg.help,
                content: new VariableUiElement(userDetails.map(userdetails => {
                    if (userdetails.csCount < Constants.userJourney.mapCompleteHelpUnlock) {
                        return ""
                    }
                    return new Combine([Translations.t.general.aboutMapcomplete, "<br/>Version " + Constants.vNumber]).SetClass("link-underline").Render();
                }, [Locale.language]))
            }
        );

        return new TabbedComponent(tabs, State.state.welcomeMessageOpenedTab)
            .ListenTo(userDetails);
    }

    InnerRender(): string {
        return this._component.Render();

    }

}