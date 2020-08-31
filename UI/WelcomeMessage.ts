import {UIElement} from "./UIElement";
import Locale from "../UI/i18n/Locale";
import {State} from "../State";
import {Layout} from "../Customizations/Layout";
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

        function fromLayout(f: (layout: Layout) => (string | UIElement)): UIElement {
            return Translations.W(f(State.state.layoutToUse.data));
        }

        this.description = fromLayout((layout) => layout.welcomeMessage);
        this.plzLogIn = 
            fromLayout((layout) => layout.gettingStartedPlzLogin
                .onClick(() => {State.state.osmConnection.AttemptLogin()})
            );
        this.welcomeBack = fromLayout((layout) => layout.welcomeBackMessage);
        this.tail = fromLayout((layout) => layout.welcomeTail);
    }

    protected InnerUpdate(htmlElement: HTMLElement) {
        super.InnerUpdate(htmlElement);
        console.log("Innerupdating welcome message")
        this.plzLogIn.Update();
    }
    

    InnerRender(): string {

        let loginStatus = undefined;
        if (State.state.featureSwitchUserbadge.data) {
            loginStatus = (State.state.osmConnection.userDetails.data.loggedIn ? this.welcomeBack : 
                this.plzLogIn);
        }

        return new Combine([
            this.description,
            "<br/></br>",
           // TODO this button is broken - figure out why loginStatus,
            this.tail,
            "<br/>",
            this.languagePicker
        ]).Render()
    }


}