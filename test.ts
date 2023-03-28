import SvelteUIElement from "./UI/Base/SvelteUIElement"
import ThemeViewGUI from "./UI/ThemeViewGUI.svelte"
import { FixedUiElement } from "./UI/Base/FixedUiElement"
import LayoutConfig from "./Models/ThemeConfig/LayoutConfig"
import * as benches from "./assets/generated/themes/benches.json"

async function main() {
    new FixedUiElement("").AttachTo("extradiv")
    const layout = new LayoutConfig(<any>benches, true) // qp.data === "" ?  : new AllKnownLayoutsLazy().get(qp.data)
    new SvelteUIElement(ThemeViewGUI, { layout }).AttachTo("maindiv")
}

async function test() {
    // new LengthInput().AttachTo("maindiv")
}
//test().then((_) => {})
main().then((_) => {})
