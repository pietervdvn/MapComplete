import ScriptUtils from "./ScriptUtils";
import {Utils} from "../Utils";
import {lstatSync, readdirSync, readFileSync, writeFileSync} from "fs";

Utils.runningFromConsole = true
import LayerConfig from "../Customizations/JSON/LayerConfig";
import {error} from "util";
import * as licenses from "../assets/generated/license_info.json"
import SmallLicense from "../Models/smallLicense";
import LayoutConfig from "../Customizations/JSON/LayoutConfig";
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
const themeFiles : any[] = ScriptUtils.readDirRecSync("./assets/themes")
    .filter(path => path.indexOf(".json") > 0)
    .filter(path => path.indexOf("license_info.json") < 0)
    .map(path => {
        return JSON.parse(readFileSync(path, "UTF8"));
    })
writeFileSync("./assets/generated/known_layers_and_themes.json", JSON.stringify({
    "layers": layerFiles,
    "themes": themeFiles
}))


console.log("Discovered ", layerFiles.length, "layers and ", themeFiles.length, "themes\n")
console.log("   ---------- VALIDATING ---------")
// ------------- VALIDATION --------------
const licensePaths = []
for (const i in licenses) {
    licensePaths.push(licenses[i].path)
}
const knownPaths = new Set<string>(licensePaths)

function validateLayer(layer: LayerConfig, context?:string) : number{
    let errorCount = 0;
    const images = Array.from(layer.ExtractImages())
    const remoteImages = images.filter(img => img.indexOf("http") == 0)
    for (const remoteImage of remoteImages) {
        console.error("Found a remote image:", remoteImage, "in layer", layer.id)
        errorCount++
    }
    for (const image of images) {
        if (!knownPaths.has(image)) {
            console.error("Image with path", image, "not found or not attributed; it is used in", layer.id, context === undefined ? "" : ` in a layer defined in the theme ${context}`)
            errorCount++
        }
    }
    return errorCount
}
let layerErrorCount = 0
const knownLayerIds = new Set<string>();
for (const layerFile of layerFiles) {
    knownLayerIds.add(layerFile.id)
    try {
        const layer = new LayerConfig(layerFile, "test", true)
       layerErrorCount += validateLayer(layer)
    } catch (e) {
        console.error("Layer ", layerFile.id, " is invalid: ", e)
        layerErrorCount++
    }
    if (layerFile.overpassTags !== undefined) {
        layerErrorCount++
        console.warn("Layer ", layerFile.id, "still uses the old 'overpassTags'-format. Please use 'source: {osmTags: <tags>}' instead")
    }
}

let themeErrorCount = 0
for (const themeFile of themeFiles) {

    for (const layer of themeFile.layers) {
        if(typeof layer === "string"){
            if(!knownLayerIds.has(layer)){
                console.error("Unknown layer id: ", layer)
                themeErrorCount++
            }
        }
    }
    
    themeFile.layers = themeFile.layers.filter(l => typeof l != "string")
    
    try {
        const layout = new LayoutConfig(themeFile, true, "test")
        for (const layer of layout.layers) {
            layerErrorCount += validateLayer(layer, layout.id)
        }
    } catch (e) {
        console.error("Could not parse theme", themeFile["id"], "due to", e)
        themeErrorCount++;
    }
}

console.log("Found ", layerErrorCount, "errors in the layers; "+themeErrorCount+" errors in the themes")