import ScriptUtils from "./ScriptUtils";
import {readFileSync, writeFileSync} from "fs";


function main() {

    const allSchemas = ScriptUtils.readDirRecSync("./Docs/Schemas").filter(pth => pth.endsWith("JSC.ts"))
    for (const path of allSchemas) {
        const dir = path.substring(0, path.lastIndexOf("/"))
        const name = path.substring(path.lastIndexOf("/"), path.length - "JSC.ts".length)
        let content = readFileSync(path, "UTF-8")
        content = content.substring("export default ".length)
        let parsed = JSON.parse(content)
        parsed["additionalProperties"] = false

        for (const key in parsed.definitions) {
            const def = parsed.definitions[key]
            console.log("Patching ", key)
            if (def.type === "object") {
                def["additionalProperties"] = false
            }
        }

        writeFileSync(dir + "/" + name + ".schema.json", JSON.stringify(parsed, null, "  "), "UTF8")
    }
}

main()
