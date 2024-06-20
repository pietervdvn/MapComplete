import SvelteUIElement from "./Base/SvelteUIElement"
import StudioGUI from "./StudioGUI.svelte"

export default class StudioGui {
    public setup() {
        new StudioGUI({
            target: document.getElementById("main"),
        })
    }
}

new StudioGui().setup()
