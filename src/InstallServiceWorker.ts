export {}
window.addEventListener("load", async () => {
    if (!("serviceWorker" in navigator)) {
        console.log("Service workers are not supported")
        return
    }
    try {
        await navigator.serviceWorker.register("/service-worker.js")
        console.log("Service worker registration successful")
    } catch (err) {
        console.error("Service worker registration failed", err)
    }
})
