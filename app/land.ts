import { OsmConnection } from "../src/Logic/Osm/OsmConnection"
import Constants from "../src/Models/Constants"

console.log("Authorizing...")
const key = Constants.osmAuthConfig.url + "oauth2_state"
const st =window.localStorage.getItem(key  )
console.log("Prev state is",key, st)
new OsmConnection().finishLogin((_, token: string) => {
	console.log("Login finished, redirecting to passthrough")
   	window.location.href = "https://app.mapcomplete.org/passthrough.html?oauth_token="+token
})
