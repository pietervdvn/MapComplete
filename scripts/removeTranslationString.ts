import ScriptUtils from "./ScriptUtils"
import { Utils } from "../Utils"
import * as fs from "fs"

async function main(args: string[]) {
    if (args.length !== 1) {
        console.log("Usage: first argument is the fully qualified key of the string to remove")
        return
    }
    const path = args[0].split(".")
    console.log("Removing translation string ", path, "from the general translations")
    const files = ScriptUtils.readDirRecSync("./langs", 1).filter((f) => f.endsWith(".json"))
    for (const file of files) {
        const json = JSON.parse(fs.readFileSync(file, "UTF-8"))
        Utils.WalkPath(path, json, (_) => undefined)
        fs.writeFileSync(file, JSON.stringify(json, null, "    ") + "\n")
    }
}

const args = [...process.argv]
args.splice(0, 2)
main(args).then((_) => {
    console.log("All done!")
})
