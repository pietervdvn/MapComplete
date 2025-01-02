import InspectorGUI from "./InspectorGUI.svelte"

const target = document.getElementById("main")
target.innerHTML = ""
new InspectorGUI({
    target
})
