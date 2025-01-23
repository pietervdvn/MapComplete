import DetermineTheme from "./Logic/DetermineTheme"
import SvelteUIElement from "./UI/Base/SvelteUIElement"
import { FixedUiElement } from "./UI/Base/FixedUiElement"
import Combine from "./UI/Base/Combine"
import { SubtleButton } from "./UI/Base/SubtleButton"
import { Utils } from "./Utils"
import ArrowDownTray from "@babeard/svelte-heroicons/mini/ArrowDownTray"
import SingleThemeGui from "./UI/SingleThemeGui.svelte"


async function main() {
    try {

        const theme = await DetermineTheme.getTheme()
        const target = document.getElementById("maindiv")
        const childs = Array.from(target.children)
        new SingleThemeGui({
            target,
            props: { theme }
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
