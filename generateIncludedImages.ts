import * as fs from "fs";
import {Utils} from "./Utils";

function genImages() {

    console.log("Generating images")
    const dir = fs.readdirSync("./assets/svg")

    let module = "import {Img} from \"./UI/Img\";\nimport {FixedUiElement} from \"./UI/Base/FixedUiElement\";\n\nexport default class Svg {\n\n\n";
    for (const path of dir) {

        if (!path.endsWith(".svg")) {
            throw "Non-svg file detected in the svg files: " + path;
        }

        const svg = fs.readFileSync("./assets/svg/" + path, "utf-8")
            .replace(/<\?xml.*?>/, "")
            .replace(/fill: ?none;/g,"fill: none !important;") // This is such a brittle hack...
            .replace(/\n/g, " ")
            .replace(/\r/g, "")
            .replace(/\\/g, "\\")
            .replace(/"/g, "\\\"")
        const name = path.substr(0, path.length - 4)
            .replace(/[ -]/g, "_");
        module += `    public static ${name} = "${svg}"\n`
        module += `    public static ${name}_img = Img.AsImageElement(Svg.${name})\n`
        module += `    public static ${name}_svg() { return new FixedUiElement(Svg.${name});}\n`
        module += `    public static ${name}_ui() { return new FixedUiElement(Svg.${name}_img);}\n\n`
    }
    module += "}\n";
    fs.writeFileSync("Svg.ts", module);
    console.log("Done")
}

function isTranslation(tr: any): boolean {
    for (const key in tr) {
        if (typeof tr[key] !== "string") {
            return false;
        }
    }
    return true;
}

function transformTranslation(obj: any, depth = 1) {

    if (isTranslation(obj)) {
        return `new Translation( ${JSON.stringify(obj)} )`
    }

    let values = ""
    for (const key in obj) {
        values += (Utils.Times((_) => "  ", depth)) + key + ": " + transformTranslation(obj[key], depth + 1) + ",\n"
    }
    return `{${values}}`;

}

function genTranslations() {
    const translations = JSON.parse(fs.readFileSync("./assets/translations.json", "utf-8"))
    const transformed = transformTranslation(translations);

    let module = `import {Translation} from "./UI/i18n/Translation"\n\nexport default class AllTranslationAssets {\n\n`;
    module += " public static t = " + transformed;
    module += "}"

    fs.writeFileSync("AllTranslationAssets.ts", module);


}

genTranslations()
genImages()