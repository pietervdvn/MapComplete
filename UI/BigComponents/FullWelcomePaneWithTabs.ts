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
import {FixedUiElement} from "../Base/FixedUiElement";
import CombinedInputElement from "../Input/CombinedInputElement";

export default class FullWelcomePaneWithTabs extends UIElement {
    private readonly _layoutToUse: UIEventSource<LayoutConfig>;
    private readonly _userDetails: UIEventSource<UserDetails>;

    private readonly _component: UIElement;

    constructor() {
        super(State.state.layoutToUse);
        this._layoutToUse = State.state.layoutToUse;
        this._userDetails = State.state.osmConnection.userDetails;


        const layoutToUse = this._layoutToUse.data;
        let welcome: UIElement = new ThemeIntroductionPanel();
        if (layoutToUse.id === personal.id) {
            welcome = new PersonalLayersPanel();
        }
        const tabs = [
            {header: `<img src='${layoutToUse.icon}'>`, content: welcome},
            {
                header: Svg.osm_logo_img,
                content: Translations.t.general.openStreetMapIntro as UIElement
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
                content: new VariableUiElement(this._userDetails.map(userdetails => {
                    if (userdetails.csCount < Constants.userJourney.mapCompleteHelpUnlock) {
                        return ""
                    }
                    return new Combine([Translations.t.general.aboutMapcomplete, "<br/>Version " + Constants.vNumber]).Render();
                }, [Locale.language]))
            }
        );

        const tabbedPart = new TabbedComponent(tabs, State.state.welcomeMessageOpenedTab)
            .ListenTo(this._userDetails);

        const backButton = new Combine([
            new Combine([Translations.t.general.returnToTheMap.Clone().SetClass("to-the-map")])
                .SetClass("to-the-map-inner")
                
        ]).SetClass("only-on-mobile")
            .onClick(() => State.state.fullScreenMessage.setData(undefined));

        this._component = new Combine([tabbedPart, backButton]).SetStyle("width:100%;");
    }

    InnerRender(): string {
        return this._component.Render();

    }

}