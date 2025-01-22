import AppIndex from "./AppIndex.svelte"

const target = document.getElementById("main")
target.innerHTML = ""
new AppIndex({ target })
