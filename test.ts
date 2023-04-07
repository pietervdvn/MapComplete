import SvelteUIElement from "./UI/Base/SvelteUIElement"
import ThemeViewGUI from "./UI/ThemeViewGUI.svelte"
import { FixedUiElement } from "./UI/Base/FixedUiElement"
import LayoutConfig from "./Models/ThemeConfig/LayoutConfig"
import * as theme from "./assets/generated/themes/shops.json"
import ThemeViewState from "./Models/ThemeViewState"
import Combine from "./UI/Base/Combine"
import SpecialVisualizations from "./UI/SpecialVisualizations"
import AddNewPoint from "./UI/Popup/AddNewPoint/AddNewPoint.svelte"
import UserProfile from "./UI/BigComponents/UserProfile.svelte"

async function main() {
    new FixedUiElement("").AttachTo("extradiv")
    const layout = new LayoutConfig(<any>theme, true) // qp.data === "" ?  : new AllKnownLayoutsLazy().get(qp.data)
    const state = new ThemeViewState(layout)

    const main = new SvelteUIElement(ThemeViewGUI, { state })
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
    const layout = new LayoutConfig(<any>theme, true) // qp.data === "" ?  : new AllKnownLayoutsLazy().get(qp.data)
    const state = new ThemeViewState(layout)
    new SvelteUIElement(UserProfile, { osmConnection: state.osmConnection }).AttachTo("maindiv")
}

/*
test().then((_) => {}) /*/
main().then((_) => {}) //*/
