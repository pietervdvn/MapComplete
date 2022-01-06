import {FixedUiElement} from "./UI/Base/FixedUiElement";
import Combine from "./UI/Base/Combine";
import {SubtleButton} from "./UI/Base/SubtleButton";
import Svg from "./Svg";

new Combine([new FixedUiElement("This page is not found"),
new SubtleButton(Svg.back_svg(), "Back to index", {
    url: "./index.html",
    newTab: false
})
]).AttachTo("maindiv")