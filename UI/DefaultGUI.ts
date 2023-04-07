import { Utils } from "../Utils"
import Toggle from "./Input/Toggle"
import LeftControls from "./BigComponents/LeftControls"
import RightControls from "./BigComponents/RightControls"
import CenterMessageBox from "./CenterMessageBox"
import ScrollableFullScreen from "./Base/ScrollableFullScreen"
import Translations from "./i18n/Translations"
import { DefaultGuiState } from "./DefaultGuiState"
import Combine from "./Base/Combine"
import ExtraLinkButton from "./BigComponents/ExtraLinkButton"
import GeoLocationHandler from "../Logic/Actors/GeoLocationHandler"
import CopyrightPanel from "./BigComponents/CopyrightPanel"

/**
 * The default MapComplete GUI initializer
 *
 * Adds a welcome pane, control buttons, ... etc to index.html
 */
export default class DefaultGUI {
    private readonly guiState: DefaultGuiState
    private readonly geolocationHandler: GeoLocationHandler | undefined

    constructor(guiState: DefaultGuiState) {
        this.guiState = guiState
    }

    public setup() {
        this.SetupUIElements()

        if (
            this.state.layoutToUse.customCss !== undefined &&
            window.location.pathname.indexOf("index") >= 0
        ) {
            Utils.LoadCustomCss(this.state.layoutToUse.customCss)
        }
    }

    private SetupUIElements() {
        const guiState = this.guiState

        const extraLink = Toggle.If(
            state.featureSwitchExtraLinkEnabled,
            () => new ExtraLinkButton(state, state.layoutToUse.extraLink)
        )

        new ScrollableFullScreen(
            () => Translations.t.general.attribution.attributionTitle,
            () => new CopyrightPanel(state),
            "copyright",
            guiState.copyrightViewIsOpened
        )

        new Combine([extraLink]).SetClass("flex flex-col").AttachTo("top-left")

        new Combine([
            new ExtraLinkButton(state, {
                ...state.layoutToUse.extraLink,
                newTab: true,
                requirements: new Set<
                    "iframe" | "no-iframe" | "welcome-message" | "no-welcome-message"
                >(),
            }),
        ])
            .SetClass("flex items-center justify-center normal-background h-full")
            .AttachTo("on-small-screen")

        new LeftControls(state, guiState).AttachTo("bottom-left")
        new RightControls(state, this.geolocationHandler).AttachTo("bottom-right")

        new CenterMessageBox(state).AttachTo("centermessage")
        document?.getElementById("centermessage")?.classList?.add("pointer-events-none")
    }
}
