import DetermineLayout from "./Logic/DetermineLayout"
import ThemeViewState from "./Models/ThemeViewState"
import SvelteUIElement from "./UI/Base/SvelteUIElement"
import ThemeViewGUI from "./UI/ThemeViewGUI.svelte"
import { FixedUiElement } from "./UI/Base/FixedUiElement"
import Combine from "./UI/Base/Combine"
import { SubtleButton } from "./UI/Base/SubtleButton"
import { Utils } from "./Utils"
import Download from "./assets/svg/Download.svelte"
import Constants from "./Models/Constants"

function webgl_support() {
    try {
        const canvas = document.createElement("canvas")
        return (
            !!window.WebGLRenderingContext &&
            (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
        )
    } catch (e) {
        return false
    }
}

async function timeout(timeMS: number): Promise<{ layers: string[] }> {
    await Utils.waitFor(timeMS)
    return { layers: [] }
}

async function getAvailableLayers(): Promise<Set<string>> {
    try {
        const host = new URL(Constants.VectorTileServer).host
        const status: { layers: string[] } = await Promise.any([
            Utils.downloadJson<{layers}>("https://" + host + "/summary/status.json"),
            timeout(2500),
        ])
        return new Set<string>(status.layers)
    } catch (e) {
        console.error("Could not get MVT available layers due to", e)
        return new Set<string>()
    }
}

async function main() {
    // @ts-ignore
    try {
        if (!webgl_support()) {
            throw "WebGL is not supported or not enabled. This is essential for MapComplete to function, please enable this."
        }
        const [layout, availableLayers] = await Promise.all([
            DetermineLayout.GetLayout(),
            await getAvailableLayers(),
        ])
        console.log("The available layers on server are", Array.from(availableLayers))
        const state = new ThemeViewState(layout, availableLayers)
        const main = new SvelteUIElement(ThemeViewGUI, { state })
        main.AttachTo("maindiv")
        Array.from(document.getElementsByClassName("delete-on-load")).forEach((el) => {
            el.parentElement.removeChild(el)
        })
    } catch (err) {
        console.error("Error while initializing: ", err, err.stack)
        const customDefinition = DetermineLayout.getCustomDefinition()
        new Combine([
            new FixedUiElement(err.toString().split("\n").join("<br/>")).SetClass("block alert"),

            customDefinition?.length > 0
                ? new SubtleButton(new SvelteUIElement(Download), "Download the raw file").onClick(
                      () =>
                          Utils.offerContentsAsDownloadableFile(
                              DetermineLayout.getCustomDefinition(),
                              "mapcomplete-theme.json",
                              { mimetype: "application/json" }
                          )
                  )
                : undefined,
        ]).AttachTo("maindiv")
    }
}

main().then((_) => {})
