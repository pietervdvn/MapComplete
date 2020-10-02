import {UIElement} from "./UIElement";
import Locale from "../UI/i18n/Locale";
import State from "../State";
import Translations from "./i18n/Translations";
import Combine from "./Base/Combine";
import {InitUiElements} from "../InitUiElements";


export class WelcomeMessage extends UIElement {
    private languagePicker: UIElement;

    private readonly description: UIElement;
    private readonly plzLogIn: UIElement;
    private readonly welcomeBack: UIElement;
    private readonly tail: UIElement;


    constructor() {
        super(State.state.osmConnection.userDetails);
        this.ListenTo(Locale.language);
        this.languagePicker = InitUiElements.CreateLanguagePicker(Translations.t.general.pickLanguage);
        const layout = State.state.layoutToUse.data;

        this.description =Translations.W(layout.welcomeMessage);
        this.plzLogIn =
            Translations.W(layout.gettingStartedPlzLogin)
                .onClick(() => {
                    State.state.osmConnection.AttemptLogin()
                });
        this.welcomeBack = Translations.W(layout.welcomeBackMessage);
        this.tail = Translations.W(layout.welcomeTail);
    }

    InnerRender(): string {

        let loginStatus = undefined;
        if (State.state.featureSwitchUserbadge.data) {
            loginStatus = (State.state.osmConnection.userDetails.data.loggedIn ? this.welcomeBack : 
                this.plzLogIn);
        }

        return new Combine([
            this.description,
            "<br/><br/>",
            loginStatus,
            this.tail,
            "<br/>",
            this.languagePicker
        ]).Render()
    }


}