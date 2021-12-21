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

// Miscelleanous
Utils.DisableLongPresses()
document.getElementById("decoration-desktop").remove();
new AllThemesGui();