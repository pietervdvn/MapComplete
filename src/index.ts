import DetermineLayout from "./Logic/DetermineLayout"
import ThemeViewState from "./Models/ThemeViewState"
import SvelteUIElement from "./UI/Base/SvelteUIElement"
import ThemeViewGUI from "./UI/ThemeViewGUI.svelte"
import { FixedUiElement } from "./UI/Base/FixedUiElement"
import Combine from "./UI/Base/Combine"
import { SubtleButton } from "./UI/Base/SubtleButton"
import Svg from "./Svg"
import { Utils } from "./Utils"

// @ts-ignore
try {
    DetermineLayout.GetLayout()
        .then((layout) => {
            const state = new ThemeViewState(layout)
            const main = new SvelteUIElement(ThemeViewGUI, { state })
            main.AttachTo("maindiv")
        })
        .catch((err) => {
            console.error("Error while initializing: ", err, err.stack)
            new Combine([
                new FixedUiElement(err).SetClass("block alert"),

                new SubtleButton(Svg.download_svg(), "Download the raw file").onClick(() =>
                    Utils.offerContentsAsDownloadableFile(
                        DetermineLayout.getCustomDefinition(),
                        "mapcomplete-theme.json",
                        { mimetype: "application/json" }
                    )
                ),
            ]).AttachTo("maindiv")
        })
} catch (err) {
    new FixedUiElement(err).SetClass("block alert").AttachTo("maindiv")
}
