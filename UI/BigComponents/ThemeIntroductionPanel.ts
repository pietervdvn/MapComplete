import Locale from "../i18n/Locale";
import {UIElement} from "../UIElement";
import State from "../../State";
import Combine from "../Base/Combine";
import LanguagePicker from "../LanguagePicker";
import Translations from "../i18n/Translations";
import {VariableUiElement} from "../Base/VariableUIElement";

export default class ThemeIntroductionPanel extends UIElement {
    private languagePicker: UIElement;

    private readonly description: UIElement;
    private readonly plzLogIn: UIElement;
    private readonly welcomeBack: UIElement;
    private readonly tail: UIElement;
    private readonly loginStatus: UIElement;


    constructor() {
        super(State.state.osmConnection.userDetails);
        this.ListenTo(Locale.language);
        this.languagePicker = LanguagePicker.CreateLanguagePicker(State.state.layoutToUse.data.language, Translations.t.general.pickLanguage);
        const layout = State.state.layoutToUse.data;

        this.description = new Combine([
            "<h3>", layout.title, "</h3>",
            layout.description
        ])
        this.plzLogIn =
            Translations.t.general.loginWithOpenStreetMap
                .onClick(() => {
                    State.state.osmConnection.AttemptLogin()
                });
        this.welcomeBack = Translations.t.general.welcomeBack;
        this.tail = layout.descriptionTail;
        this.loginStatus = new VariableUiElement(
            State.state.osmConnection.userDetails.map(
                userdetails => {
                    if (State.state.featureSwitchUserbadge.data) {
                        return "";
                    }
                    return (userdetails.loggedIn ? this.welcomeBack : this.plzLogIn).Render();
                }
            )
            
        )
    }

    InnerRender(): string {
        return new Combine([
            this.description,
            "<br/><br/>",
            this.loginStatus,
            this.tail,
            "<br/>",
            this.languagePicker
        ]).Render()
    }


}
