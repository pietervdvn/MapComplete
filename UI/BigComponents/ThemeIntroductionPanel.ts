import State from "../../State";
import Combine from "../Base/Combine";
import LanguagePicker from "../LanguagePicker";
import Translations from "../i18n/Translations";
import {VariableUiElement} from "../Base/VariableUIElement";
import Toggle from "../Input/Toggle";
import {SubtleButton} from "../Base/SubtleButton";
import Svg from "../../Svg";
import {UIEventSource} from "../../Logic/UIEventSource";

export default class ThemeIntroductionPanel extends VariableUiElement {

    constructor(isShown: UIEventSource<boolean>) {

        const languagePicker =
            new VariableUiElement(
                State.state.layoutToUse.map(layout => LanguagePicker.CreateLanguagePicker(layout.language, Translations.t.general.pickLanguage.Clone()))
            )
        ;
        
        const toTheMap = new SubtleButton(
            undefined,
            Translations.t.general.openTheMap.Clone().SetClass("text-xl font-bold w-full text-center")
        ).onClick(() =>{
            isShown.setData(false)
        }).SetClass("only-on-mobile")

        const plzLogIn =
            new SubtleButton(
                Svg.osm_logo_ui(),
                
                new Combine([Translations.t.general.loginWithOpenStreetMap
                    .Clone().SetClass("text-xl font-bold"),
                    Translations.t.general.loginOnlyNeededToEdit.Clone().SetClass("font-bold")]
                    ).SetClass("flex flex-col text-center w-full")
            )
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
            toTheMap,
            loginStatus,
            layout.descriptionTail.Clone(),
            "<br/>",
            languagePicker,
            ...layout.CustomCodeSnippets()
        ])))

        this.SetClass("link-underline")
    }
}
