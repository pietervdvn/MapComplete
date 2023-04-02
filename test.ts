import SvelteUIElement from "./UI/Base/SvelteUIElement"
import ThemeViewGUI from "./UI/ThemeViewGUI.svelte"
import { FixedUiElement } from "./UI/Base/FixedUiElement"
import LayoutConfig from "./Models/ThemeConfig/LayoutConfig"
import * as theme from "./assets/generated/themes/shops.json"
import { UIEventSource } from "./Logic/UIEventSource"
import ThemeViewState from "./Models/ThemeViewState"
import Combine from "./UI/Base/Combine"
import SpecialVisualizations from "./UI/SpecialVisualizations"
import ValidatedInput from "./UI/InputElement/ValidatedInput.svelte"
import { VariableUiElement } from "./UI/Base/VariableUIElement"
import { Translation } from "./UI/i18n/Translation"

async function main() {
    new FixedUiElement("").AttachTo("extradiv")
    const layout = new LayoutConfig(<any>theme, true) // qp.data === "" ?  : new AllKnownLayoutsLazy().get(qp.data)
    const main = new SvelteUIElement(ThemeViewGUI, { layout })
    main.AttachTo("maindiv")
}

async function testspecial() {
    const layout = new LayoutConfig(<any>theme, true) // qp.data === "" ?  : new AllKnownLayoutsLazy().get(qp.data)
    const state = new ThemeViewState(layout)

    const all = SpecialVisualizations.specialVisualizations.map((s) =>
        SpecialVisualizations.renderExampleOfSpecial(state, s)
    )
    new Combine(all).AttachTo("maindiv")
}
async function test() {
    const value = new UIEventSource("Hello world!")
    const feedback = new UIEventSource<Translation>(undefined)
    new SvelteUIElement(ValidatedInput, { type: "direction", value, feedback }).AttachTo("maindiv")
    new VariableUiElement(feedback).AttachTo("extradiv")
}
/*
test().then((_) => {}) /*/
main().then((_) => {}) //*/
