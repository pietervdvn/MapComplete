import { OsmConnection } from "./Logic/Osm/OsmConnection"

console.log("Authorizing...")
new OsmConnection().finishLogin((previousURL) => {
    const fallback = window.location.protocol + "//" + window.location.host + "/index.html"
    previousURL ??= fallback
    if (previousURL.indexOf("/land") > 0) {
        previousURL = fallback
    }
    console.log("Redirecting to", previousURL)
    window.location.href = previousURL
})
