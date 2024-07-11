import * as fs from "fs"
import Script from "./Script"

function genImages(dryrun = false) {
    console.log("Generating images")
    const dir = fs.readdirSync("./assets/svg")
    for (const path of dir) {
        if (path.endsWith("license_info.json")) {
            continue
        }
        if (path.endsWith(".license")) {
            continue
        }

        if (!path.endsWith(".svg")) {
            throw "Non-svg file detected in the svg files: " + path
        }

        let svg: string = fs
            .readFileSync("./assets/svg/" + path, "utf-8")
            .replace(/<\?xml.*?>/, "")
            .replace(/<!DOCTYPE [^>]*>/, "")
            .replace(/fill: ?none;/g, "fill: none !important;") // This is such a brittle hack...
            .replace(/\n/g, " ")
            .replace(/\r/g, "")
            .replace(/\\/g, "\\")
            .replace(/"/g, "\\\"")
            .replaceAll(" ", " ")

        let hasNonAsciiChars = Array.from(svg)
            .filter((char) => char.charCodeAt(0) > 127)
            .map((char) => char.charCodeAt(0))
            .join(", ")
        if (hasNonAsciiChars.length > 0) {
            throw "The svg '" + path + "' has non-ascii characters: " + hasNonAsciiChars
        }
        const name = path.substring(0, path.length - 4).replace(/[ -]/g, "_")

        const nameUC = name.toUpperCase().at(0) + name.substring(1)
        const svelteCode =
            "<script>\nexport let color = \"#000000\"\n</script>\n" +
            svg
                .replace(
                    "<svg ",
                    "<svg {...$$$$restProps} on:click on:mouseover on:mouseenter on:mouseleave on:keydown on:focus ",
                )
                .replace(/\\"/g, "\"")
                .replace(/(rgb\(0%,0%,0%\)|#000000|#000)/g, "{color}")
        fs.writeFileSync("./src/assets/svg/" + nameUC + ".svelte", svelteCode, "utf8")

    }
}


class GenerateIncludedImages extends Script {
    constructor() {
        super("Converts all images from assets/svg into svelte-classes.")
    }

    async main(args: string[]): Promise<void> {
        genImages()

    }
}

new GenerateIncludedImages().run()
