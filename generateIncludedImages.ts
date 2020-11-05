import * as fs from "fs";

console.log("Generating images")

const dir = fs.readdirSync("./assets/svg")
console.log(dir)

let module = "import {Img} from \"./UI/Img\";\nimport {FixedUiElement} from \"./UI/Base/FixedUiElement\";\n\nexport default class Svg {\n\n\n";
for (const path of dir) {
    
    if(!path.endsWith(".svg")){
        throw "Non-svg file detected in the svg files: "+path;
    }
    
    const svg = fs.readFileSync("./assets/svg/"+path, "utf-8")
        .replace(/\n/g, " ")
        .replace(/\r/g, "")
        .replace(/\\/g, "\\")
        .replace(/"/g, "\\\"")
    const name = path.substr(0, path.length-4)
        .replace(/[ -]/g, "_");
    module += `    public static ${name} = "${svg}"\n`
    module += `    public static ${name}_img = Img.AsImageElement(Svg.${name})\n`
    module += `    public static ${name}_ui() { return new FixedUiElement(Svg.${name}_img);}\n\n`
}
module += "}\n";
fs.writeFileSync("Svg.ts", module);
console.log("Done")