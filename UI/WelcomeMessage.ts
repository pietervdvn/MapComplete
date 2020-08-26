import {UIElement} from "../UI/UIElement";
import {OsmConnection, UserDetails} from "../Logic/Osm/OsmConnection";
import Locale from "../UI/i18n/Locale";
import {State} from "../State";
import {Layout} from "../Customizations/Layout";
import Translations from "./i18n/Translations";
import {VariableUiElement} from "./Base/VariableUIElement";
import {Utils} from "../Utils";
import {UIEventSource} from "../Logic/UIEventSource";


export class WelcomeMessage extends UIElement {
    private readonly layout: Layout;
    private languagePicker: UIElement;
    private osmConnection: OsmConnection;

    private readonly description: UIElement;
    private readonly plzLogIn: UIElement;
    private readonly welcomeBack: UIElement;
    private readonly tail: UIElement;


    constructor() {
        super(State.state.osmConnection.userDetails);
        this.ListenTo(Locale.language);
        this.languagePicker = Utils.CreateLanguagePicker(Translations.t.general.pickLanguage);

        function fromLayout(f: (layout: Layout) => (string | UIElement)): UIElement {
            return Translations.W(f(State.state.layoutToUse.data));
        }

        this.description = fromLayout((layout) => layout.welcomeMessage);
        this.plzLogIn = fromLayout((layout) => layout.gettingStartedPlzLogin);
        this.plzLogIn.onClick(()=> State.state.osmConnection.AttemptLogin());
        this.welcomeBack = fromLayout((layout) => layout.welcomeBackMessage);
        this.tail = fromLayout((layout) => layout.welcomeTail);
    }

    InnerRender(): string {

        let loginStatus = "";
        if (State.state.featureSwitchUserbadge.data) {
            loginStatus = (State.state.osmConnection.userDetails.data.loggedIn ? this.welcomeBack : this.plzLogIn).Render();
            loginStatus = loginStatus + "<br/>"
        }

        return "<span>" +
            this.description.Render() +
            "<br/></br>" +
            loginStatus +
            this.tail.Render() +
            "<br/>" +
            this.languagePicker.Render() +
            "</span>";
    }


}