import ScriptUtils from "./ScriptUtils";
import {Utils} from "../Utils";
import {lstatSync, readdirSync, readFileSync, writeFileSync} from "fs";

Utils.runningFromConsole = true
import LayerConfig from "../Customizations/JSON/LayerConfig";
import {error} from "util";
import * as licenses from "../assets/generated/license_info.json"
import SmallLicense from "../Models/smallLicense";
import LayoutConfig from "../Customizations/JSON/LayoutConfig";
import {LayerConfigJson} from "../Customizations/JSON/LayerConfigJson";
import {Layer} from "leaflet";
// This scripts scans 'assets/layers/*.json' for layer definition files and 'assets/themes/*.json' for theme definition files.
// It spits out an overview of those to be used to load them


// First, remove the old file. It might be buggy!
writeFileSync("./assets/generated/known_layers_and_themes.json", JSON.stringify({
    "layers": [],
    "themes": []
}))
const layerFiles = ScriptUtils.readDirRecSync("./assets/layers")
    .filter(path => path.indexOf(".json") > 0)
    .filter(path => path.indexOf("license_info.json") < 0)
    .map(path => {
        try {
            const parsed = JSON.parse(readFileSync(path, "UTF8"));
            return parsed
        } catch (e) {
            console.error("Could not parse file ", path, "due to ", e)
        }
    })
const themeFiles: any[] = ScriptUtils.readDirRecSync("./assets/themes")
    .filter(path => path.indexOf(".json") > 0)
    .filter(path => path.indexOf("license_info.json") < 0)
    .map(path => {
        return JSON.parse(readFileSync(path, "UTF8"));
    })
writeFileSync("./assets/generated/known_layers_and_themes.json", JSON.stringify({
    "layers": layerFiles,
    "themes": themeFiles
}))


console.log("Discovered", layerFiles.length, "layers and", themeFiles.length, "themes\n")
console.log("   ---------- VALIDATING ---------")
// ------------- VALIDATION --------------
const licensePaths = []
for (const i in licenses) {
    licensePaths.push(licenses[i].path)
}
const knownPaths = new Set<string>(licensePaths)

function validateLayer(layerJson: LayerConfigJson, context?: string): string[] {
    let errorCount = [];
    if (layerJson["overpassTags"] !== undefined) {
        errorCount.push("Layer " + layerJson.id + "still uses the old 'overpassTags'-format. Please use \"source\": {\"osmTags\": <tags>}' instead of \"overpassTags\": <tags> (note: this isn't your fault, the custom theme generator still spits out the old format)")
    }
    try {
        const layer = new LayerConfig(layerJson, "test", true)
        const images = Array.from(layer.ExtractImages())
        const remoteImages = images.filter(img => img.indexOf("http") == 0)
        for (const remoteImage of remoteImages) {
            errorCount.push("Found a remote image: " + remoteImage + " in layer " + layer.id + ", please download it.")
            const path = remoteImage.substring(remoteImage.lastIndexOf("/") + 1)
          }
        for (const image of images) {
            if (!knownPaths.has(image)) {
                const ctx = context === undefined ? "" : ` in a layer defined in the theme ${context}`
                errorCount.push(`Image with path ${image} not found or not attributed; it is used in ${layer.id}${ctx}`)
            }
        }

    } catch (e) {
        return [`Layer ${layerJson.id}` ?? JSON.stringify(layerJson).substring(0, 50) + " is invalid: " + e]
    }
    return errorCount
}

let layerErrorCount = []
const knownLayerIds = new Set<string>();
for (const layerFile of layerFiles) {
    knownLayerIds.add(layerFile.id)
    layerErrorCount.push(...validateLayer(layerFile))
}

let themeErrorCount = []
for (const themeFile of themeFiles) {

    for (const layer of themeFile.layers) {
        if (typeof layer === "string") {
            if (!knownLayerIds.has(layer)) {
                themeErrorCount.push("Unknown layer id: " + layer)
            }
        } else {
            if (layer.builtin !== undefined) {
                if (!knownLayerIds.has(layer.builtin)) {
                    themeErrorCount.push("Unknown layer id: " + layer.builtin + "(which uses inheritance)")
                }
            } else {
                // layer.builtin contains layer overrides - we can skip those
                layerErrorCount.push(...validateLayer(layer, themeFile.id))
            }
        }
    }

    themeFile.layers = themeFile.layers
        .filter(l => typeof l != "string") // We remove all the builtin layer references as they don't work with ts-node for some weird reason
        .filter(l => l.builtin === undefined)

    try {
        const theme = new LayoutConfig(themeFile, true, "test")
        if (theme.id !== theme.id.toLowerCase()) {
            themeErrorCount.push("Theme ids should be in lowercase, but it is " + theme.id)
        }
    } catch (e) {
        themeErrorCount.push("Could not parse theme " + themeFile["id"] + "due to", e)
    }
}

if (layerErrorCount.length + themeErrorCount.length == 0) {
    console.log("All good!")
} else {
    const errors = layerErrorCount.concat(themeErrorCount).join("\n")
    console.log(errors)
    const msg = (`Found ${layerErrorCount.length} errors in the layers; ${themeErrorCount.length} errors in the themes`)
    console.log(msg)
    if (process.argv.indexOf("--report") >= 0) {
        console.log("Writing report!")
        writeFileSync("layer_report.txt", errors)
    }

    if (process.argv.indexOf("--no-fail") < 0) {
        throw msg;
    }
}
