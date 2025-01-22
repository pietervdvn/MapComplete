import { OsmConnection } from "../src/Logic/Osm/OsmConnection"
import Constants from "../src/Models/Constants"
import { Utils } from "../src/Utils"
import { UIEventSource } from "../src/Logic/UIEventSource"
import { VariableUiElement } from "../src/UI/Base/VariableUIElement"

console.log("Authorizing...")
const key = Constants.osmAuthConfig.url + "oauth2_state"
const st = window.localStorage.getItem(key)
console.log("Prev state is", key, st)
const tokenSrc = new UIEventSource("")
new VariableUiElement(tokenSrc).AttachTo("token")


new OsmConnection().finishLogin(async (_, token: string) => {
    console.log("Login finished, redirecting to passthrough; token is " + token)
    tokenSrc.set(token)
    await Utils.waitFor(500)
    window.location.href = "orgmapcomplete://passthrough.html?oauth_token=" + token
    tokenSrc.set("Closing...")
    await Utils.waitFor(50)
    window.close()
})
