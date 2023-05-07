import * as fs from "fs"
import Constants from "../Models/Constants";

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
        module += `    public static ${name}_img = Img.AsImageElement(Svg.${rawName})\n`
        module += `    public static ${name}_svg() { return new Img(Svg.${rawName}, true);}\n`
       // module += `    /**@deprecated*/ public static ${name}_ui() { return new FixedUiElement(Svg.${rawName}_img);}\n\n`
        if (Constants.defaultPinIcons.indexOf(name) >= 0 && !dryrun) {
            allNames.push(`"${path}": Svg.${name}`)
        }
    }
    module += `public static All = {${allNames.join(",")}};`
    module += "}\n"
    fs.writeFileSync("Svg.ts", module)
    console.log("Done")
}

genImages(false)
