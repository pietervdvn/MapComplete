import * as languages from "../assets/generated/used_languages.json"
import { readFileSync, writeFileSync } from "fs"

/**
 * Moves values around in 'section'. Section will be changed
 * @param section
 * @param referenceSection
 * @param language
 */
function fixSection(section, referenceSection, language: string) {
    if (section === undefined) {
        return
    }
    outer: for (const key of Object.keys(section)) {
        const v = section[key]
        if (typeof v === "string" && referenceSection[key] === undefined) {
            // Not found in reference, search for a subsection with this key
            for (const subkey of Object.keys(referenceSection)) {
                const subreference = referenceSection[subkey]
                if (subreference[key] !== undefined) {
                    if (section[subkey] !== undefined && section[subkey][key] !== undefined) {
                        console.log(`${subkey}${key} is already defined... Looking furhter`)
                        continue
                    }
                    if (typeof section[subkey] === "string") {
                        console.log(
                            `NOT overwriting '${section[subkey]}' for ${subkey} (needed for ${key})`
                        )
                    } else {
                        // apply fix
                        if (section[subkey] === undefined) {
                            section[subkey] = {}
                        }
                        section[subkey][key] = section[key]
                        delete section[key]
                        console.log(
                            `Rewritten key: ${key} --> ${subkey}.${key} in language ${language}`
                        )
                        continue outer
                    }
                }
            }
            console.log("No solution found for " + key)
        }
    }
}

function main(args: string[]): void {
    const sectionName = args[0]
    const l = args[1]
    if (sectionName === undefined) {
        console.log(
            "Tries to automatically move translations to a new subsegment. Usage: 'sectionToCheck' 'language'"
        )
        return
    }
    const reference = JSON.parse(readFileSync("./langs/en.json", "UTF8"))
    const path = `./langs/${l}.json`
    const file = JSON.parse(readFileSync(path, "UTF8"))
    fixSection(file[sectionName], reference[sectionName], l)
    writeFileSync(path, JSON.stringify(file, null, "    ") + "\n")
}

main(process.argv.slice(2))
