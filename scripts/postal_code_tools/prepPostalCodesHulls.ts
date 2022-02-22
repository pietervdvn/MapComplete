import * as fs from "fs";
import {writeFileSync} from "fs";
import ScriptUtils from "../ScriptUtils";

function handleFile(file: string, postalCode: number) {

    const geojson = JSON.parse(fs.readFileSync(file, "UTF8"))
    geojson.properties = {
        type: "boundary",
        "boundary": "postal_code",
        "postal_code": postalCode + ""
    }
    return geojson
}


function getKnownPostalCodes(): number[] {
    return fs.readFileSync("./scripts/postal_code_tools/knownPostalCodes.csv", "UTF8").split("\n")
        .map(line => Number(line.split(",")[1]))
}

function main(args: string[]) {
    const dir = args[0]
    const knownPostals = new Set<number>(getKnownPostalCodes())
    const files = ScriptUtils.readDirRecSync(dir, 1)
    const allFiles = []
    const skipped = []
    for (const file of files) {
        const nameParts = file.split("-")
        const postalCodeStr = nameParts[nameParts.length - 1]
        const postalCode = Number(postalCodeStr.substr(0, postalCodeStr.length - ".geojson.convex.geojson".length))
        if (isNaN(postalCode)) {
            console.error("Not a number: ", postalCodeStr)
            continue
        }
        if (knownPostals.has(postalCode)) {
            skipped.push(postalCode)
            ScriptUtils.erasableLog("Skipping boundary for ", postalCode, "as it is already known - skipped ", skipped.length, "already")
            continue
        }
        allFiles.push(handleFile(file, postalCode))
    }


    writeFileSync("all_postal_codes_filtered.geojson", JSON.stringify({
        type: "FeatureCollection",
        features: allFiles
    }))

}

let args = [...process.argv]
args.splice(0, 2)
main(args)