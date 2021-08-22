import {UIEventSource} from "./Logic/UIEventSource";
import AllKnownLayers from "./Customizations/AllKnownLayers";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import {TagUtils} from "./Logic/Tags/TagUtils";
import Combine from "./UI/Base/Combine";
import Svg from "./Svg";
import Translations from "./UI/i18n/Translations";
import LayerConfig from "./Models/ThemeConfig/LayerConfig";
import AddNewMarker from "./UI/BigComponents/AddNewMarker";


function genMarker(filteredLayers: UIEventSource<{ appliedFilters: undefined; isDisplayed: UIEventSource<boolean>; layerDef: LayerConfig }[]>) {
return new AddNewMarker(filteredLayers)

}

let filteredLayers = new UIEventSource([
    {
        layerDef: AllKnownLayers.sharedLayers.get("toilet"),
        isDisplayed: new UIEventSource<boolean>(true),
        appliedFilters: undefined
    }
])
genMarker(filteredLayers).SetStyle("width: 50px; height: 70px")
    .SetClass("block border-black border")
    .AttachTo("maindiv")

new FixedUiElement("").AttachTo("extradiv")