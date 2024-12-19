import { OsmConnection } from "./Logic/Osm/OsmConnection"
import Constants from "./Models/Constants"

console.log("Authorizing...")
const key = Constants.osmAuthConfig.url + "oauth2_state"
const st =window.localStorage.getItem(key  )
console.log("Prev state is",key, st)
new OsmConnection().finishLogin((previousURL) => {

    const fallback = window.location.protocol + "//" + window.location.host + "/index.html"
    previousURL ??= fallback
    if (previousURL.indexOf("/land") > 0) {
        previousURL = fallback
    }
    console.log("Redirecting to", previousURL)
    window.location.href = previousURL
})
