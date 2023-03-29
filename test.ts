import SvelteUIElement from "./UI/Base/SvelteUIElement"
import ThemeViewGUI from "./UI/ThemeViewGUI.svelte"
import { FixedUiElement } from "./UI/Base/FixedUiElement"
import LayoutConfig from "./Models/ThemeConfig/LayoutConfig"
import * as benches from "./assets/generated/themes/cyclofix.json"
import { UIEventSource } from "./Logic/UIEventSource"
import ThemeViewState from "./Models/ThemeViewState"
import { SpecialVisualization, SpecialVisualizationState } from "./UI/SpecialVisualization"
import { Feature } from "geojson"
import Combine from "./UI/Base/Combine"
import SpecialVisualizations from "./UI/SpecialVisualizations"
import BaseUIElement from "./UI/BaseUIElement"

async function main() {
    new FixedUiElement("").AttachTo("extradiv")
    const layout = new LayoutConfig(<any>benches, true) // qp.data === "" ?  : new AllKnownLayoutsLazy().get(qp.data)
    const main = new SvelteUIElement(ThemeViewGUI, { layout })
    main.AttachTo("maindiv")
}

async function test() {
    const layout = new LayoutConfig(<any>benches, true) // qp.data === "" ?  : new AllKnownLayoutsLazy().get(qp.data)
    const state = new ThemeViewState(layout)

    const all = SpecialVisualizations.specialVisualizations.map((s) =>
        SpecialVisualizations.renderExampleOfSpecial(state, s)
    )
    new Combine(all).AttachTo("maindiv")
}
// test().then((_) => {}) /*/
main().then((_) => {}) //*/
