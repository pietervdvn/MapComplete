import DetermineTheme from "./Logic/DetermineTheme"
import SvelteUIElement from "./UI/Base/SvelteUIElement"
import ThemeViewGUI from "./UI/ThemeViewGUI.svelte"
import { FixedUiElement } from "./UI/Base/FixedUiElement"
import Combine from "./UI/Base/Combine"
import { SubtleButton } from "./UI/Base/SubtleButton"
import { Utils } from "./Utils"
import Constants from "./Models/Constants"
import ArrowDownTray from "@babeard/svelte-heroicons/mini/ArrowDownTray"
import { WithSearchState } from "./Models/ThemeViewState/WithSearchState"

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
    if (!Constants.SummaryServer) {
        return new Set<string>()
    }
    try {
        const host = new URL(Constants.SummaryServer).host
        const status: { layers: string[] } = await Promise.any([
            Utils.downloadJson<{ layers }>("https://" + host + "/summary/status.json"),
            timeout(2500),
        ])
        return new Set<string>(status.layers)
    } catch (e) {
        console.error("Could not get MVT available layers due to", e)
        return new Set<string>()
    }
}

async function main() {
    try {
        if (!webgl_support()) {
            throw "WebGL is not supported or not enabled. This is essential for MapComplete to function, please enable this."
        }
        const [theme, availableLayers] = await Promise.all([
            DetermineTheme.getTheme(),
            await getAvailableLayers(),
        ])
        console.log("The available layers on server are", Array.from(availableLayers))
        const state = new WithSearchState(theme, availableLayers)
        const target = document.getElementById("maindiv")
        const childs = Array.from(target.children)
        new ThemeViewGUI({
            target,
            props: { state },
        })
        childs.forEach((ch) => target.removeChild(ch))
        Array.from(document.getElementsByClassName("delete-on-load")).forEach((el) => {
            el.parentElement.removeChild(el)
        })
    } catch (err) {
        console.error("Error while initializing: ", err, err.stack)
        const customDefinition = DetermineTheme.getCustomDefinition()
        new Combine([
            new FixedUiElement(err.toString().split("\n").join("<br/>")).SetClass("block alert"),

            customDefinition?.length > 0
                ? new SubtleButton(
                      new SvelteUIElement(ArrowDownTray),
                      "Download the raw file"
                  ).onClick(() =>
                      Utils.offerContentsAsDownloadableFile(
                          DetermineTheme.getCustomDefinition(),
                          "mapcomplete-theme.json",
                          { mimetype: "application/json" }
                      )
                  )
                : undefined,
        ]).AttachTo("maindiv")
    }
}

main().then((_) => {})
