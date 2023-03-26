import SvelteUIElement from "./UI/Base/SvelteUIElement"
import ThemeViewGUI from "./UI/ThemeViewGUI.svelte"
import { FixedUiElement } from "./UI/Base/FixedUiElement"
import { QueryParameters } from "./Logic/Web/QueryParameters"
import LayoutConfig from "./Models/ThemeConfig/LayoutConfig"
import * as benches from "./assets/generated/themes/benches.json"

async function main() {
    new FixedUiElement("Determining layout...").AttachTo("maindiv")
    const qp = QueryParameters.GetQueryParameter("layout", "")
    new FixedUiElement("").AttachTo("extradiv")
    const layout = new LayoutConfig(<any>benches, true) // qp.data === "" ?  : new AllKnownLayoutsLazy().get(qp.data)
    console.log("Using layout", layout.id)
    new SvelteUIElement(ThemeViewGUI, { layout }).AttachTo("maindiv")
}

main().then((_) => {})
