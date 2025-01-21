/**
 * The Android Polyfill will attempt to communicate with the Anrdoid Shell.
 * If this is successful, it will patch some webAPIs
 */
import { registerPlugin } from "@capacitor/core"
import { Store, UIEventSource } from "../UIEventSource"
import { OsmConnection } from "../Osm/OsmConnection"

export interface DatabridgePlugin {
    request<T extends (string | object) = string | object>(options: { key: string }): Promise<{ value: T }>;
}

const DatabridgePluginSingleton = registerPlugin<DatabridgePlugin>("Databridge", {
    web: () => {
        return <DatabridgePlugin>{
            async request(options: { key: string }): Promise<{ value: string | object }> {
                console.log("Android polyfill got request for", options.key)
                if (options.key === "meta") {
                    return { value: "web" }
                }
                return null
            }
        }
    }
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

    public static async requestLoginCodes() {
        const result = await DatabridgePluginSingleton.request<{oauth_token: string}>({ key: "request:login" })
        const token: string = result.value.oauth_token
        console.log("AndroidPolyfill: received oauth_token; trying to pass them to the oauth lib",token)
        return token
    }

    public static onBackButton(callback: () => boolean, options: {
        returnToIndex: Store<boolean>
    }) {
        console.log("Registering back button callback", callback)
        DatabridgePluginSingleton.request({ key: "backbutton" }).then(ev => {
            console.log("AndroidPolyfill: received backbutton: ", ev)
            if(ev === null){
                // Probably in web environment
                return
            }
            // We have to re-register every time
            AndroidPolyfill.onBackButton(callback, options)
            if (callback()) {
                return
            }
            // Nothing more to close - we return (if not a single theme) to the index
            if (options.returnToIndex) {
                console.log("Back to the index!")
                window.location.href = "/"
            }
        })

    }
}

