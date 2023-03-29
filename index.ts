import { FixedUiElement } from "./UI/Base/FixedUiElement"
import Combine from "./UI/Base/Combine"
import { Utils } from "./Utils"
import AllThemesGui from "./UI/AllThemesGui"
import DetermineLayout from "./Logic/DetermineLayout"
import LayoutConfig from "./Models/ThemeConfig/LayoutConfig"
import ShowOverlayLayerImplementation from "./UI/ShowDataLayer/ShowOverlayLayerImplementation"
import { DefaultGuiState } from "./UI/DefaultGuiState"

ShowOverlayLayerImplementation.Implement()
// Miscelleanous
Utils.DisableLongPresses()

class Init {
    public static Init(layoutToUse: LayoutConfig) {
        if (layoutToUse === null) {
            // Something went wrong, error message is already on screen
            return
        }

        if (layoutToUse === undefined) {
            // No layout found
            new AllThemesGui().setup()
            return
        }

        const guiState = new DefaultGuiState()
        DefaultGuiState.state = guiState
    }
}

document.getElementById("decoration-desktop").remove()
new Combine([
    "Initializing... <br/>",
    new FixedUiElement(
        "<a>If this message persist, something went wrong - click here to try again</a>"
    )
        .SetClass("link-underline small")
        .onClick(() => {
            localStorage.clear()
            window.location.reload()
        }),
]).AttachTo("centermessage") // Add an initialization and reset button if something goes wrong

// @ts-ignore
DetermineLayout.GetLayout()
    .then((value) => {
        console.log("Got ", value)
        Init.Init(value)
    })
    .catch((err) => {
        console.error("Error while initializing: ", err, err.stack)
    })
