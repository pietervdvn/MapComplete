import SvelteUIElement from "./Base/SvelteUIElement"
import StudioGUI from "./StudioGUI.svelte"

export default class StudioGui {
    public setup() {
        new SvelteUIElement(StudioGUI, {}).SetClass("h-full").AttachTo("main")
    }
}

new StudioGui().setup()
