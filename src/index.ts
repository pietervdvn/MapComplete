import DetermineTheme from "./Logic/DetermineTheme"
import SingleThemeGui from "./UI/SingleThemeGui.svelte"
import CustomThemeError from "./UI/CustomThemeError.svelte"

async function main() {
    const target = document.getElementById("maindiv")
    const childs = Array.from(target.children)
    try {
        childs.forEach((ch) => target.removeChild(ch))
    } catch (e) {
        console.error("Huh? Couldn't remove child!")
    }
    try {
        const theme = await DetermineTheme.getTheme()
        new SingleThemeGui({
            target,
            props: { theme },
        })
        Array.from(document.getElementsByClassName("delete-on-load")).forEach((el) => {
            el.parentElement.removeChild(el)
        })
    } catch (err) {
        console.error("Error while initializing: ", err, err.stack)
        const customDefinition = DetermineTheme.getCustomDefinition()

        new CustomThemeError({
            target,
            props: {
                stack: err.toString().split("\n"),
                customDefinition,
            },
        })
    }
}

main().then((_) => {})
