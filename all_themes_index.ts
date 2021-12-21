import {FixedUiElement} from "./UI/Base/FixedUiElement";
import {QueryParameters} from "./Logic/Web/QueryParameters";
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
AvailableBaseLayers.implement(new AvailableBaseLayersImplementation())
ShowOverlayLayerImplementation.Implement();
// Miscelleanous
Utils.DisableLongPresses()

// --------------------- Special actions based on the parameters -----------------
// @ts-ignore
if (location.href.startsWith("http://buurtnatuur.be")) {
    // Reload the https version. This is important for the 'locate me' button
    window.location.replace("https://buurtnatuur.be");
}


class Init {
    public static Init(layoutToUse: LayoutConfig, encoded: string) {

        if (layoutToUse === null) {
            // Something went wrong, error message is already on screen
            return;
        }

        if (layoutToUse === undefined) {
            // No layout found
            new AllThemesGui()
            return;
        }

        // Workaround/legacy to keep the old paramters working as I renamed some of them
        if (layoutToUse?.id === "cyclofix") {
            const legacy = QueryParameters.GetQueryParameter("layer-bike_shops", "true", "Legacy - keep De Fietsambassade working");
            const correct = QueryParameters.GetQueryParameter("layer-bike_shop", "true", "Legacy - keep De Fietsambassade working")
            if (legacy.data !== "true") {
                correct.setData(legacy.data)
            }
            console.log("layer-bike_shop toggles: legacy:", legacy.data, "new:", correct.data)

            const legacyCafe = QueryParameters.GetQueryParameter("layer-bike_cafes", "true", "Legacy - keep De Fietsambassade working")
            const correctCafe = QueryParameters.GetQueryParameter("layer-bike_cafe", "true", "Legacy - keep De Fietsambassade working")
            if (legacyCafe.data !== "true") {
                correctCafe.setData(legacy.data)
            }
        }


        const guiState = new DefaultGuiState()
        State.state = new State(layoutToUse);
        DefaultGuiState.state = guiState;
        // This 'leaks' the global state via the window object, useful for debugging
        // @ts-ignore
        window.mapcomplete_state = State.state;

        new DefaultGUI(State.state, guiState)

        if (encoded !== undefined && encoded.length > 10) {
            // We save the layout to the user settings and local storage
            State.state.osmConnection.OnLoggedIn(() => {
                State.state.osmConnection
                    .GetLongPreference("installed-theme-" + layoutToUse.id)
                    .setData(encoded);
            });
        }
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
if(typeof theme === "undefined"){
    DetermineLayout.GetLayout().then(value => {
    console.log("Got ", value)
    Init.Init(value[0], value[1])
    }).catch(err => {
        console.error("Error while initializing: ", err, err.stack)
    })
}


