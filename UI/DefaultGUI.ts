import Toggle from "./Input/Toggle"
import LeftControls from "./BigComponents/LeftControls"
import CenterMessageBox from "./CenterMessageBox"
import { DefaultGuiState } from "./DefaultGuiState"
import Combine from "./Base/Combine"
import ExtraLinkButton from "./BigComponents/ExtraLinkButton"
import GeoLocationHandler from "../Logic/Actors/GeoLocationHandler"

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
        const extraLink = Toggle.If(
            state.featureSwitchExtraLinkEnabled,
            () => new ExtraLinkButton(state, state.layoutToUse.extraLink)
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

        const guiState = this.guiState
        new LeftControls(state, guiState).AttachTo("bottom-left")

        new CenterMessageBox(state).AttachTo("centermessage")
        document?.getElementById("centermessage")?.classList?.add("pointer-events-none")
    }
}
