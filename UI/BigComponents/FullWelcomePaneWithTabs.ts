import {UIElement} from "../UIElement";
import State from "../../State";
import WelcomeMessage from "./WelcomeMessage";
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

export default class FullWelcomePaneWithTabs extends UIElement {
    private readonly _layoutToUse: UIEventSource<LayoutConfig>;
    private readonly _userDetails: UIEventSource<UserDetails>;

    private readonly _component: UIElement;

    constructor() {
        super(State.state.layoutToUse);
        this._layoutToUse = State.state.layoutToUse;
        this._userDetails = State.state.osmConnection.userDetails;

       
        const layoutToUse = this._layoutToUse.data;
        let welcome: UIElement = new WelcomeMessage();
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

        this._component = new TabbedComponent(tabs, State.state.welcomeMessageOpenedTab)
            .ListenTo(this._userDetails);


    }

    InnerRender(): string {
        return this._component.Render();

    }

}