import Combine from "../Base/Combine"
import LanguagePicker from "../LanguagePicker"
import Translations from "../i18n/Translations"
import Toggle from "../Input/Toggle"
import { SubtleButton } from "../Base/SubtleButton"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import { LoginToggle } from "../Popup/LoginButton"
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
import { OsmConnection } from "../../Logic/Osm/OsmConnection"
import LoggedInUserIndicator from "../LoggedInUserIndicator"
import { ActionButtons } from "./ActionButtons"
import { BBox } from "../../Logic/BBox"
import Loc from "../../Models/Loc"
import { DefaultGuiState } from "../DefaultGuiState"

export default class ThemeIntroductionPanel extends Combine {
    constructor(
        isShown: UIEventSource<boolean>,
        currentTab: UIEventSource<number>,
        state: {
            featureSwitchMoreQuests: UIEventSource<boolean>
            featureSwitchAddNew: UIEventSource<boolean>
            featureSwitchUserbadge: UIEventSource<boolean>
            layoutToUse: LayoutConfig
            osmConnection: OsmConnection
            currentBounds: Store<BBox>
            locationControl: UIEventSource<Loc>
            defaultGuiState: DefaultGuiState
        },
        guistate?: { userInfoIsOpened: UIEventSource<boolean> }
    ) {
        const t = Translations.t.general
        const layout = state.layoutToUse

        const languagePicker = new LanguagePicker(layout.language, t.pickLanguage.Clone())

        const toTheMap = new SubtleButton(
            undefined,
            t.openTheMap.Clone().SetClass("text-xl font-bold w-full text-center")
        )
            .onClick(() => {
                isShown.setData(false)
            })
            .SetClass("only-on-mobile")

        const loggedInUserInfo = new LoggedInUserIndicator(state.osmConnection, {
            firstLine: Translations.t.general.welcomeBack.Clone(),
        })
        if (guistate?.userInfoIsOpened) {
            loggedInUserInfo.onClick(() => {
                guistate.userInfoIsOpened.setData(true)
            })
        }

        const loginStatus = new Toggle(
            new LoginToggle(
                loggedInUserInfo,
                new Combine([
                    Translations.t.general.loginWithOpenStreetMap.SetClass("text-xl font-bold"),
                    Translations.t.general.loginOnlyNeededToEdit.Clone().SetClass("font-bold"),
                ]).SetClass("flex flex-col"),
                state
            ),
            undefined,
            state.featureSwitchUserbadge
        )

        const hasPresets = layout.layers.some((l) => l.presets?.length > 0)
        super([
            layout.description.Clone().SetClass("block mb-4"),
            new Combine([
                t.welcomeExplanation.general,
                hasPresets
                    ? Toggle.If(state.featureSwitchAddNew, () => t.welcomeExplanation.addNew)
                    : undefined,
            ]).SetClass("flex flex-col mt-2"),

            toTheMap,
            loginStatus.SetClass("block mt-6 pt-2 md:border-t-2 border-dotted border-gray-400"),
            layout.descriptionTail?.Clone().SetClass("block mt-4"),

            languagePicker?.SetClass("block mt-4 pb-8 border-b-2 border-dotted border-gray-400"),
            new ActionButtons(state),

            ...layout.CustomCodeSnippets(),
        ])

        this.SetClass("link-underline")
    }
}
