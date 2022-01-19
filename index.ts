import {FixedUiElement} from "./UI/Base/FixedUiElement";
import Combine from "./UI/Base/Combine";
import AvailableBaseLayers from "./Logic/Actors/AvailableBaseLayers";
import MinimapImplementation from "./UI/Base/MinimapImplementation";
import {Utils} from "./Utils";
import AllThemesGui from "./UI/AllThemesGui";
import DetermineLayout from "./Logic/DetermineLayout";
import LayoutConfig from "./Models/ThemeConfig/LayoutConfig";
import DefaultGUI from "./UI/DefaultGUI";
import State from "./State";
import AvailableBaseLayersImplementation from "./Logic/Actors/AvailableBaseLayersImplementation";
import ShowOverlayLayerImplementation from "./UI/ShowDataLayer/ShowOverlayLayerImplementation";
import {DefaultGuiState} from "./UI/DefaultGuiState";

// Workaround for a stupid crash: inject some functions which would give stupid circular dependencies or crash the other nodejs scripts running from console
MinimapImplementation.initialize()
ShowOverlayLayerImplementation.Implement();
// Miscelleanous
Utils.DisableLongPresses()

class Init {
    public static Init(layoutToUse: LayoutConfig) {

        if (layoutToUse === null) {
            // Something went wrong, error message is already on screen
            return;
        }

        if (layoutToUse === undefined) {
            // No layout found
            new AllThemesGui()
            return;
        }

        const guiState = new DefaultGuiState()
        State.state = new State(layoutToUse);
        DefaultGuiState.state = guiState;
        // This 'leaks' the global state via the window object, useful for debugging
        // @ts-ignore
        window.mapcomplete_state = State.state;
        new DefaultGUI(State.state, guiState)

       
    }
}


document.getElementById("decoration-desktop").remove();
new Combine(["Initializing... <br/>",
    new FixedUiElement("<a>If this message persist, something went wrong - click here to try again</a>")
        .SetClass("link-underline small")
        .onClick(() => {
            localStorage.clear();
            window.location.reload(true);

        })])
    .AttachTo("centermessage"); // Add an initialization and reset button if something goes wrong

// @ts-ignore
DetermineLayout.GetLayout().then(value => {
    console.log("Got ", value)
    Init.Init(value)
    }).catch(err => {
        console.error("Error while initializing: ", err, err.stack)
    })


