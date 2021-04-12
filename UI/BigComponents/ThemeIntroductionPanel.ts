import Locale from "../i18n/Locale";
import {UIElement} from "../UIElement";
import State from "../../State";
import Combine from "../Base/Combine";
import LanguagePicker from "../LanguagePicker";
import Translations from "../i18n/Translations";
import {VariableUiElement} from "../Base/VariableUIElement";
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";
import {UIEventSource} from "../../Logic/UIEventSource";

export default class ThemeIntroductionPanel extends UIElement {
    private languagePicker: UIElement;

    private readonly loginStatus: UIElement;
    private _layout: UIEventSource<LayoutConfig>;


    constructor() {
        super(State.state.osmConnection.userDetails);
        this.ListenTo(Locale.language);
        this.languagePicker = LanguagePicker.CreateLanguagePicker(State.state.layoutToUse.data.language, Translations.t.general.pickLanguage);
        this._layout = State.state.layoutToUse;
        this.ListenTo(State.state.layoutToUse);

        const plzLogIn =
            Translations.t.general.loginWithOpenStreetMap
                .onClick(() => {
                    State.state.osmConnection.AttemptLogin()
                });
        
        
        const welcomeBack = Translations.t.general.welcomeBack;
        
        this.loginStatus = new VariableUiElement(
            State.state.osmConnection.userDetails.map(
                userdetails => {
                    if (State.state.featureSwitchUserbadge.data) {
                        return "";
                    }
                    return (userdetails.loggedIn ? welcomeBack : plzLogIn).Render();
                }
            )
        )
        this.SetClass("link-underline")
    }

    InnerRender(): string {
        const layout : LayoutConfig = this._layout.data;
        return new Combine([
            layout.description,
            "<br/><br/>",
            this.loginStatus,
            layout.descriptionTail,
            "<br/>",
            this.languagePicker,
            ...layout.CustomCodeSnippets()
        ]).Render()
    }


}
