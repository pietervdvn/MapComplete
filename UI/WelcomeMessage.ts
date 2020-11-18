import {UIElement} from "./UIElement";
import Locale from "../UI/i18n/Locale";
import State from "../State";
import Translations from "./i18n/Translations";
import Combine from "./Base/Combine";
import LanguagePicker from "./LanguagePicker";


export class WelcomeMessage extends UIElement {
    private languagePicker: UIElement;

    private readonly description: UIElement;
    private readonly plzLogIn: UIElement;
    private readonly welcomeBack: UIElement;
    private readonly tail: UIElement;


    constructor() {
        super(State.state.osmConnection.userDetails);
        this.ListenTo(Locale.language);
        this.languagePicker = LanguagePicker.CreateLanguagePicker(State.state.layoutToUse.data.language, Translations.t.general.pickLanguage);
        const layout = State.state.layoutToUse.data;

        this.description = new Combine([
            "<h3>", layout.title, "</h3>",
            layout.description
        ])
        layout.descriptionTail
        
        


        this.plzLogIn =
            Translations.t.general.loginWithOpenStreetMap
                .onClick(() => {
                    State.state.osmConnection.AttemptLogin()
                });
        this.welcomeBack = Translations.t.general.welcomeBack;
        this.tail = layout.descriptionTail;
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