import ThemeConfig from "../ThemeConfig/ThemeConfig"
import { MenuState } from "../MenuState"
import Hotkeys from "../../UI/Base/Hotkeys"
import Translations from "../../UI/i18n/Translations"
import { WithSpecialLayers } from "./WithSpecialLayers"
import { Store } from "../../Logic/UIEventSource"

/**
 * Does all things related to:
 * - The UI state
 */
export class WithGuiState extends WithSpecialLayers {
    readonly guistate: MenuState

    constructor(theme: ThemeConfig, mvtAvailableLayers: Store<Set<string>>) {
        super(theme, mvtAvailableLayers)
        this.guistate = new MenuState(this.selectedElement)
        this.guistate.openMenuIfNeeded(
            this.featureSwitches.featureSwitchWelcomeMessage.data,
            theme.id
        )

        Object.values(this.guistate.pageStates).forEach((toggle) => {
            toggle.addCallbackD((isOpened) => {
                // When a panel is closed: focus on the map again
                if (!isOpened) {
                    if (!this.guistate.isSomethingOpen()) {
                        this.focusOnMap()
                    }
                }
            })
        })

        this.initHotkeysGui()
    }


    private initHotkeysGui() {
        const docs = Translations.t.hotkeyDocumentation

        Hotkeys.RegisterHotkey({ nomod: "f" }, docs.selectFavourites, () => {
            this.guistate.pageStates.favourites.set(true)
        })

        Hotkeys.RegisterHotkey(
            {
                nomod: "b"
            },
            docs.openLayersPanel,
            () => {
                if (this.featureSwitches.featureSwitchBackgroundSelection.data) {
                    this.guistate.pageStates.background.setData(true)
                }
            }
        )
        Hotkeys.RegisterHotkey(
            {
                nomod: "s"
            },
            Translations.t.hotkeyDocumentation.openFilterPanel,
            () => {
                if (this.featureSwitches.featureSwitchFilter.data) {
                    this.guistate.openFilterView()
                }
            }
        )
    }

    public selectCurrentView() {
        this.guistate.closeAll()
        this.selectedElement.setData(this.currentView.features?.data?.[0])
    }

}
