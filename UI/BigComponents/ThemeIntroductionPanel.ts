import Combine from "../Base/Combine"
import LanguagePicker from "../LanguagePicker"
import Translations from "../i18n/Translations"
import Toggle from "../Input/Toggle"
import { SubtleButton } from "../Base/SubtleButton"
import { UIEventSource } from "../../Logic/UIEventSource"
import { LoginToggle } from "../Popup/LoginButton"
import Svg from "../../Svg"
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
import { OsmConnection } from "../../Logic/Osm/OsmConnection"
import FullWelcomePaneWithTabs from "./FullWelcomePaneWithTabs"

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
        }
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

        const loginStatus = new Toggle(
            new LoginToggle(
                undefined,
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
            layout.description.Clone().SetClass("blcok mb-4"),
            new Combine([
                t.welcomeExplanation.general,
                hasPresets
                    ? Toggle.If(state.featureSwitchAddNew, () => t.welcomeExplanation.addNew)
                    : undefined,
            ]).SetClass("flex flex-col mt-2"),

            toTheMap,
            loginStatus.SetClass("block"),
            layout.descriptionTail?.Clone().SetClass("block mt-4"),

            languagePicker?.SetClass("block mt-4"),

            Toggle.If(state.featureSwitchMoreQuests, () =>
                new Combine([
                    t.welcomeExplanation.browseOtherThemesIntro,
                    new SubtleButton(
                        Svg.add_ui().SetClass("h-6"),
                        t.welcomeExplanation.browseMoreMaps
                    )
                        .onClick(() =>
                            currentTab.setData(FullWelcomePaneWithTabs.MoreThemesTabIndex)
                        )
                        .SetClass("h-12"),
                ]).SetClass("flex flex-col mt-6")
            ),

            ...layout.CustomCodeSnippets(),
        ])

        this.SetClass("link-underline")
    }
}
