/**
 * The Android Polyfill will attempt to communicate with the Anrdoid Shell.
 * If this is successful, it will patch some webAPIs
 */
import { registerPlugin } from "@capacitor/core"

export class AndroidPolyfill {
    private readonly databridgePlugin: DatabridgePlugin

    constructor() {
        this.databridgePlugin = registerPlugin<DatabridgePlugin>("Databridge", {
            web: () => {
                return <DatabridgePlugin>{
                    async request(options: { key: string }): Promise<{ value: string }> {
                        return { value: "web" }
                    },
                }
            },
        })

    }

    public async init(){
        const shell = await this.databridgePlugin.request({ key: "meta" })
        if(shell.value === "web"){
            console.log("Not initing Android polyfill; web detected")
            return
        }
        console.log("Detected shell:", shell.value)
    }

}

export interface DatabridgePlugin {
    request(options: { key: string }): Promise<{ value: string }>;
}

new AndroidPolyfill().init()
