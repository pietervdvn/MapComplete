import State from "../../State";
import Combine from "../Base/Combine";
import LanguagePicker from "../LanguagePicker";
import Translations from "../i18n/Translations";
import Toggle from "../Input/Toggle";
import {SubtleButton} from "../Base/SubtleButton";
import {UIEventSource} from "../../Logic/UIEventSource";
import {LoginToggle} from "../Popup/LoginButton";

export default class ThemeIntroductionPanel extends Combine {

    constructor(isShown: UIEventSource<boolean>) {
        const t = Translations.t.general
        const layout = State.state.layoutToUse

        const languagePicker = LanguagePicker.CreateLanguagePicker(layout.language, t.pickLanguage.Clone())

        const toTheMap = new SubtleButton(
            undefined,
            t.openTheMap.Clone().SetClass("text-xl font-bold w-full text-center")
        ).onClick(() => {
            isShown.setData(false)
        }).SetClass("only-on-mobile")


        const loginStatus =
            new Toggle(
                new LoginToggle(
                    t.welcomeBack,
                    new Combine([Translations.t.general.loginWithOpenStreetMap.SetClass("text-xl font-bold"),
                        Translations.t.general.loginOnlyNeededToEdit.Clone().SetClass("font-bold")]
                    ).SetClass("flex flex-col"),
                    State.state
                ),
                undefined,
                State.state.featureSwitchUserbadge
            )

        super([
            layout.description.Clone().SetClass("blcok mb-4"),
            toTheMap,
            loginStatus.SetClass("block"),
            layout.descriptionTail?.Clone().SetClass("block mt-4"),
            languagePicker?.SetClass("block mt-4"),
            ...layout.CustomCodeSnippets()
        ])

        this.SetClass("link-underline")
    }
}
