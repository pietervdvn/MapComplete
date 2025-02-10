import { OsmConnection } from "../src/Logic/Osm/OsmConnection"
import Constants from "../src/Models/Constants"
import { Utils } from "../src/Utils"
import { UIEventSource } from "../src/Logic/UIEventSource"
import { VariableUiElement } from "../src/UI/Base/VariableUIElement"
import Combine from "../src/UI/Base/Combine"

console.log("Authorizing...")
const key = Constants.osmAuthConfig.url + "oauth2_state"
const st = window.localStorage.getItem(key)
console.log("Prev state is", key, st)
const tokenSrc = new UIEventSource("")
const debug = new UIEventSource<string[]>([])

new Combine([
    new VariableUiElement(
        debug.map((debug) => "<ul><li>" + debug.join("</li><li>") + "</li></ul>")
    ),
    new VariableUiElement(tokenSrc),
]).AttachTo("token")

const connection = new OsmConnection()
connection.finishLogin(async () => {
    let token: string = undefined
    let attempt = 0
    do {
        await Utils.waitFor(500)
        token = connection.getToken()
        tokenSrc.set("Trying to get token (" + attempt + ")")
        attempt++

        const dbg = []
        Object.keys(localStorage).forEach((key) => {
            dbg.push(`${key} - ${localStorage.getItem(key)}`)
        })
        debug.set(dbg)

        if (attempt > 10) {
            window.location.reload()
        }
    } while (!token)
    console.log("Login finished, redirecting to passthrough; token is " + token)
    tokenSrc.set(token)
    if (!token) {
        tokenSrc.set("ERROR: no token retrieved!")
        return
    }
    window.location.href = "orgmapcomplete://passthrough.html?oauth_token=" + token
})
