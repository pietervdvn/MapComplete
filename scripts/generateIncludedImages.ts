import * as fs from "fs"
function genImages(dryrun = false) {
    console.log("Generating images")
    const dir = fs.readdirSync("./assets/svg")

    let module =
        'import Img from "./UI/Base/Img";\nimport {FixedUiElement} from "./UI/Base/FixedUiElement";\n\nexport default class Svg {\n\n\n'
    const allNames: string[] = []
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
            .replace(/fill: ?none;/g, "fill: none !important;") // This is such a brittle hack...
            .replace(/\n/g, " ")
            .replace(/\r/g, "")
            .replace(/\\/g, "\\")
            .replace(/"/g, '\\"')

        let hasNonAsciiChars = Array.from(svg).some((char) => char.charCodeAt(0) > 127)
        if (hasNonAsciiChars) {
            throw "The svg '" + path + "' has non-ascii characters"
        }
        const name = path.substring(0, path.length - 4).replace(/[ -]/g, "_")

        if (dryrun) {
            svg = "<omitting svg - dryrun>"
        }

        let rawName = name

        module += `    public static ${name} = "${svg}"\n`
        module += `    public static ${name}_svg() { return new Img(Svg.${rawName}, true);}\n`
        if (!dryrun) {
            allNames.push(`"${path}": Svg.${name}`)
        }

        const nameUC = name.toUpperCase().at(0) + name.substring(1)
        const svelteCode =
            '<script>\nexport let color = "#000000"\n</script>\n' +
            svg.replace(/\\"/g, '"').replace(/(rgb\(0%,0%,0%\)|#000000|#000)/g, "{color}")
        fs.writeFileSync("./src/assets/svg/" + nameUC + ".svelte", svelteCode, "utf8")
    }
    module += `public static All = {${allNames.join(",")}};`
    module += "}\n"
    fs.writeFileSync("src/Svg.ts", module)
    console.log("Done")
}

genImages()
