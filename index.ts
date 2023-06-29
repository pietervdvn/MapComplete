import { Utils } from "./Utils"
import DetermineLayout from "./Logic/DetermineLayout"
import ThemeViewState from "./Models/ThemeViewState"
import SvelteUIElement from "./UI/Base/SvelteUIElement"
import ThemeViewGUI from "./UI/ThemeViewGUI.svelte"
import { FixedUiElement } from "./UI/Base/FixedUiElement"

// @ts-ignore
try {
    DetermineLayout.GetLayout()
        .then((layout) => {
            const state = new ThemeViewState(layout)
            const main = new SvelteUIElement(ThemeViewGUI, { state })
            main.AttachTo("maindiv")
        })
        .catch((err) => {
            console.error("Error while initializing: ", err, err.stack)
            new FixedUiElement(err).SetClass("block alert").AttachTo("maindiv")
        })
} catch (err) {
    new FixedUiElement(err).SetClass("block alert").AttachTo("maindiv")
}
