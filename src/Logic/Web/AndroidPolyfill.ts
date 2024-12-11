/**
 * The Android Polyfill will attempt to communicate with the Anrdoid Shell.
 * If this is successful, it will patch some webAPIs
 */
import { registerPlugin } from "@capacitor/core"
import { Store, UIEventSource } from "../UIEventSource"
import { OsmConnection } from "../Osm/OsmConnection"

export interface DatabridgePlugin {
    request(options: { key: string }): Promise<{ value: string | object }>;
}

const DatabridgePluginSingleton = registerPlugin<DatabridgePlugin>("Databridge", {
    web: () => {
        return <DatabridgePlugin>{
            async request(options: { key: string }): Promise<{ value: string | object }> {
                return { value: "web" }
            },
        }
    },
})

export class AndroidPolyfill {
    private readonly databridgePlugin: DatabridgePlugin = DatabridgePluginSingleton
    private static readonly _inAndroid: UIEventSource<boolean> = new UIEventSource<boolean>(false)
    public static readonly inAndroid: Store<boolean> = AndroidPolyfill._inAndroid
    private static readonly _geolocationPermission: UIEventSource<"granted" | "denied" | "prompt"> = new UIEventSource("prompt")
    public static readonly geolocationPermission: Store<"granted" | "denied" | "prompt"> = this._geolocationPermission

    /**
     * Registers 'navigator.'
     * @private
     */
    private backfillGeolocation(databridgePlugin: DatabridgePlugin) {
        const origQueryFunc = navigator?.permissions?.query
        const src = UIEventSource.FromPromise(databridgePlugin.request({ key: "location:request-permission" }))
        src.addCallbackAndRunD(permission => {
            AndroidPolyfill._geolocationPermission.set(<"granted" | "denied">permission.value)
        })
    }

    public async init() {
        console.log("Sniffing shell version")
        const shell = await this.databridgePlugin.request({ key: "meta" })
        if (shell.value === "web") {
            console.log("Not initing Android polyfill as not in a shell; web detected")
            return
        }
        AndroidPolyfill._inAndroid.set(true)
        console.log("Detected shell:", shell.value)
        this.backfillGeolocation(this.databridgePlugin)
    }

    public static async requestLoginCodes(osmConnection: OsmConnection) {
        const result = await DatabridgePluginSingleton.request({ key: "request:login" })
        const code: string = result["code"]
        const state: string = result["state"]
        console.log("AndroidPolyfill: received code and state; trying to pass them to the oauth lib")
        window.location.search = "?code=" + code + "&state=" + state
        osmConnection.finishLogin((oldLocation) => {
            console.log("Login should be completed, oldLocation is", oldLocation)
        })
    }

}
