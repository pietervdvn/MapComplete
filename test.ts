import SvelteUIElement from "./UI/Base/SvelteUIElement"
import ThemeViewGUI from "./UI/ThemeViewGUI.svelte"
import { FixedUiElement } from "./UI/Base/FixedUiElement"
import { QueryParameters } from "./Logic/Web/QueryParameters"
import { AllKnownLayoutsLazy } from "./Customizations/AllKnownLayouts"

async function main() {
    new FixedUiElement("Determining layout...").AttachTo("maindiv")
    const qp = QueryParameters.GetQueryParameter("layout", "benches")
    const layout = new AllKnownLayoutsLazy().get(qp.data)
    console.log("Using layout", layout.id)
    new SvelteUIElement(ThemeViewGUI, { layout }).AttachTo("maindiv")
}

main().then((_) => {})
