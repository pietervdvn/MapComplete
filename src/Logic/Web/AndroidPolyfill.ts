/**
 * The Android Polyfill will attempt to communicate with the Anrdoid Shell.
 * If this is successful, it will patch some webAPIs
 */
import { registerPlugin } from "@capacitor/core"
import { Store, UIEventSource } from "../UIEventSource"
import { OsmConnection } from "../Osm/OsmConnection"

export interface DatabridgePlugin {
    request<T extends string | object = string | object>(options: {
        key: string
    }): Promise<{ value: T }>
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
            },
        }
    },
})

export class AndroidPolyfill {
    private static readonly databridgePlugin: DatabridgePlugin = DatabridgePluginSingleton
    private static readonly _inAndroid: UIEventSource<boolean> = new UIEventSource<boolean>(false)
    public static readonly inAndroid: Store<boolean> = AndroidPolyfill._inAndroid
    private static readonly _geolocationPermission: UIEventSource<"granted" | "denied" | "prompt"> =
        new UIEventSource("prompt")
    public static readonly geolocationPermission: Store<"granted" | "denied" | "prompt"> =
        this._geolocationPermission

    /**
     * Registers 'navigator.'
     * @private
     */
    private static backfillGeolocation(databridgePlugin: DatabridgePlugin) {
        const src = UIEventSource.FromPromise(
            databridgePlugin.request({ key: "location:has-permission" })
        )
        src.addCallbackAndRunD((permission) => {
            console.log(
                "> Checking geopermission gave: ",
                JSON.stringify(permission),
                permission.value
            )
            const granted = permission.value === "true"
            AndroidPolyfill._geolocationPermission.set(granted ? "granted" : "denied")
        })
    }

    public static async requestGeoPermission(): Promise<{ value: string | object }> {
        return DatabridgePluginSingleton.request({ key: "location:request-permission" })
    }

    public static async init() {
        console.log("Sniffing shell version")
        const shell = await AndroidPolyfill.databridgePlugin.request({ key: "meta" })
        if (shell.value === "web") {
            console.log("Not initing Android polyfill as not in a shell; web detected")
            return
        }
        AndroidPolyfill._inAndroid.set(true)
        console.log("Detected shell:", shell.value)
        AndroidPolyfill.backfillGeolocation(AndroidPolyfill.databridgePlugin)
    }

    public static async  openLoginPage(){
        await DatabridgePluginSingleton.request<{ oauth_token: string }>({ key: "open:login" })
    }
    public static async requestLoginCodes() {
        const result = await DatabridgePluginSingleton.request<{ oauth_token: string }>({
            key: "request:login",
        })
        const token: string = result.value.oauth_token
        console.log(
            "AndroidPolyfill: received oauth_token; trying to pass them to the oauth lib",
            token
        )
        return token
    }

    public static onBackButton(
        callback: () => boolean,
        options: {
            returnToIndex: Store<boolean>
        }
    ) {
        console.log("Registering back button callback", callback)
        DatabridgePluginSingleton.request({ key: "backbutton" }).then((ev) => {
            console.log("AndroidPolyfill: received backbutton: ", ev)
            if (ev === null) {
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

    public static watchLocation(
        writeInto: UIEventSource<GeolocationCoordinates>,
        callback: (location) => void
    ) {
        DatabridgePluginSingleton.request({
            key: "location:watch",
        }).then(
            (l: {
                value: {
                    latitude: number
                    longitude: number
                    accuraccy: number
                    altidude: number
                    heading: number
                    speed: number
                }
            }) => {
                // example l: {"value":{"latitude":51.0618627,"longitude":3.730468566666667,"accuracy":2.0393495559692383,"altitude":46.408,"heading":168.2969970703125}}
                console.log("Received location from Android:", JSON.stringify(l))
                const loc = l.value
                writeInto.set({
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    heading: loc.heading,
                    accuracy: loc.accuraccy,
                    altitude: loc.altidude,
                    altitudeAccuracy: undefined,
                    speed: loc.speed,
                })
            }
        )
    }
}
