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
                State.state.layoutToUse.map(layout => LanguagePicker.CreateLanguagePicker(layout.language, Translations.t.general.pickLanguage.Clone()))
            )
        ;

        const plzLogIn =
            Translations.t.general.loginWithOpenStreetMap
                .Clone()
                .onClick(() => {
                    State.state.osmConnection.AttemptLogin()
                });


        const welcomeBack = Translations.t.general.welcomeBack.Clone();

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
            layout.description.Clone(),
            "<br/><br/>",
            loginStatus,
            layout.descriptionTail.Clone(),
            "<br/>",
            languagePicker,
            ...layout.CustomCodeSnippets()
        ])))

        this.SetClass("link-underline")
    }
}
