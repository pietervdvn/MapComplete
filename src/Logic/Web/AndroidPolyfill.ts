/**
 * The Android Polyfill will attempt to communicate with the Anrdoid Shell.
 * If this is successful, it will patch some webAPIs
 */
import { registerPlugin } from "@capacitor/core"
import { UIEventSource } from "../UIEventSource"

export interface DatabridgePlugin {
    request(options: { key: string }): Promise<{ value: string }>;
}

const DatabridgePluginSingleton = registerPlugin<DatabridgePlugin>("Databridge", {
    web: () => {
        return <DatabridgePlugin>{
            async request(options: { key: string }): Promise<{ value: string }> {
                return { value: "web" }
            },
        }
    },
})

export class AndroidPolyfill {
    private readonly databridgePlugin: DatabridgePlugin = DatabridgePluginSingleton

    /**
     * Registers 'navigator.'
     * @private
     */
    private backfillGeolocation(databridgePlugin: DatabridgePlugin) {
        const origQueryFunc = navigator?.permissions?.query
        navigator.permissions.query = async (descr: PermissionDescriptor) => {
            if (descr.name === "geolocation") {
                console.log("Got a geolocation permission request")
                const src = UIEventSource.FromPromise(databridgePlugin.request({ key: "location:request-permission" }))

                return <PermissionStatus>{
                    state: undefined,
                    addEventListener(key: "change", f: (value: "granted" | "denied") => void) {
                        src.addCallbackAndRunD(v => {
                            const content = <"granted" | "denied">v.value
                            f(content)
                            return true
                        })
                    },
                }
            }
            if (origQueryFunc) {
                return await origQueryFunc(descr)
            }
        }
    }

    public async init() {
        console.log("Sniffing shell version")
        const shell = await this.databridgePlugin.request({ key: "meta" })
        if (shell.value === "web") {
            console.log("Not initing Android polyfill as not in a shell; web detected")
            return
        }
        console.log("Detected shell:", shell.value)
        this.backfillGeolocation(this.databridgePlugin)
    }

}
