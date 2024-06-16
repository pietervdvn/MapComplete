import ScriptUtils from "./ScriptUtils"
import { Utils } from "../src/Utils"
import * as fs from "fs"

async function main(args: string[]) {
    let directory = "./langs"

    {
        const dirs = ["layers", "themes", "shared-questions"]
        for (const dir of dirs) {
            const layerIndex = args.findIndex((s) => s === "--" + dir)
            if (layerIndex >= 0) {
                directory = "./langs/" + dir
                args.splice(layerIndex, 1)
            }
        }
    }

    if (args.length !== 1) {
        console.log(
            "Usage: first argument is the fully qualified key of the string to remove. Removes translations in the core translations, unless '--layers' or '--themes' is given"
        )
        return
    }

    // Path within the JSON which will be removed - not the path in the filesystem!
    const path = args[0].split(".")
    console.log("Removing translation string ", path, "from the translations for " + directory)
    const files = ScriptUtils.readDirRecSync(directory, 1).filter((f) => f.endsWith(".json"))
    const removedLanguages: string[] = []
    for (const file of files) {
        const rawContents = fs.readFileSync(file, { encoding: "utf-8" })
        const json = JSON.parse(rawContents)
        Utils.WalkPath(path, json, (found) => {
            removedLanguages.push(file)
            console.log("Removing ", found)
            return undefined
        })
        const lastChar = rawContents.endsWith("\n") ? "\n" : ""
        fs.writeFileSync(file, JSON.stringify(json, null, "    ") + lastChar)
    }
    if (removedLanguages.length === 0) {
        console.warn("No items removed. Doublecheck the paths")
    } else {
        console.log("Removed items in " + removedLanguages.join(", "))
    }
}

const args = [...process.argv]
args.splice(0, 2)
main(args).then((_) => {
    console.log("All done!")
})
