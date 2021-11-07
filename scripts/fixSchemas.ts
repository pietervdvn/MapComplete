import ScriptUtils from "./ScriptUtils";
import {readFileSync, writeFileSync} from "fs";

const allSchemas = ScriptUtils.readDirRecSync("./Docs/Schemas").filter(pth => pth.endsWith("JSC.ts"))

for (const path of allSchemas) {
    const dir = path.substring(0, path.lastIndexOf("/"))
    const name = path.substring(path.lastIndexOf("/"), path.length  - "JSC.ts".length)
    let content = readFileSync(path, "UTF-8")
    content = content.substring("export default ".length)
    let parsed = JSON.parse(content)
    parsed["additionalProperties"] = false
    writeFileSync(dir+"/"+name+".schema.json", JSON.stringify(parsed, null, "  "), "UTF8")
}