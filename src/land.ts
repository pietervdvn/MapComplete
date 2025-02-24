import { QueryParameters } from "./Logic/Web/QueryParameters"
import { OsmConnection } from "./Logic/Osm/OsmConnection"
import { LocalStorageSource } from "./Logic/Web/LocalStorageSource"

console.log("Authorizing...")

if (QueryParameters.wasInitialized("error")) {
// error=access_denied&error_description=The+resource+owner+or+authorization+server+denied+the+request.
    alert("Access was denied")
    const previousLocation = LocalStorageSource.get("location_before_login")
    window.location.href = previousLocation.data ?? "./"
} else {
    new OsmConnection().finishLogin((previousURL) => {
        const fallback = window.location.protocol + "//" + window.location.host + "/index.html"
        previousURL ??= fallback
        if (previousURL.indexOf("/land") > 0) {
            previousURL = fallback
        }
        console.log("Redirecting to", previousURL)
        window.location.href = previousURL
    })
}
