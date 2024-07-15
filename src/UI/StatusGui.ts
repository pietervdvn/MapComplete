import StatusGUI from "./Status/StatusGUI.svelte"

export default class StatusGui {
    public setup() {
        new StatusGUI({
            target: document.getElementById("main"),
        })
    }
}

new StatusGui().setup()
