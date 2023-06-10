import LayoutConfig from "./Models/ThemeConfig/LayoutConfig"
import * as theme from "./assets/generated/themes/bookcases.json"
import ThemeViewState from "./Models/ThemeViewState"
import Combine from "./UI/Base/Combine"
import SpecialVisualizations from "./UI/SpecialVisualizations"
import ValidatedInput from "./UI/InputElement/ValidatedInput.svelte";
import SvelteUIElement from "./UI/Base/SvelteUIElement";
import {UIEventSource} from "./Logic/UIEventSource";
import {Unit} from "./Models/Unit";
import {Denomination} from "./Models/Denomination";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import {FixedUiElement} from "./UI/Base/FixedUiElement";

function testspecial() {
    const layout = new LayoutConfig(<any>theme, true) // qp.data === "" ?  : new AllKnownLayoutsLazy().get(qp.data)
    const state = new ThemeViewState(layout)

    const all = SpecialVisualizations.specialVisualizations.map((s) =>
        SpecialVisualizations.renderExampleOfSpecial(state, s)
    )
    new Combine(all).AttachTo("maindiv")
}

/*/
testspecial()
//*/
