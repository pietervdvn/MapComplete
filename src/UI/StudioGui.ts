import SvelteUIElement from "./Base/SvelteUIElement"
import StudioGUI from "./StudioGUI.svelte"

export default class StudioGui {
    public setup() {
        new SvelteUIElement(StudioGUI, {}).AttachTo("main")
    }
}

new StudioGui().setup()
