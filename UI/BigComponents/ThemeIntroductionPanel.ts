import State from "../../State";
import Combine from "../Base/Combine";
import LanguagePicker from "../LanguagePicker";
import Translations from "../i18n/Translations";
import {VariableUiElement} from "../Base/VariableUIElement";
import Toggle from "../Input/Toggle";

export default class ThemeIntroductionPanel extends VariableUiElement {

    constructor() {

        const languagePicker =
            new VariableUiElement(
                State.state.layoutToUse.map(layout => LanguagePicker.CreateLanguagePicker(layout.language, Translations.t.general.pickLanguage))
            )
        ;

        const plzLogIn =
            Translations.t.general.loginWithOpenStreetMap
                .onClick(() => {
                    State.state.osmConnection.AttemptLogin()
                });


        const welcomeBack = Translations.t.general.welcomeBack;

        const loginStatus =
            new Toggle(
                new Toggle(
                    welcomeBack,
                    plzLogIn,
                    State.state.osmConnection.isLoggedIn
                ),
                undefined,
                State.state.featureSwitchUserbadge
            )


        super(State.state.layoutToUse.map (layout => new Combine([
            layout.description,
            "<br/><br/>",
            loginStatus,
            layout.descriptionTail,
            "<br/>",
            languagePicker,
            ...layout.CustomCodeSnippets()
        ])))

        this.SetClass("link-underline")
    }
}
