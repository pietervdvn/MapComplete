
/*
 * This script reads all theme and layer files and reformats them inplace
 * Use with caution, make a commit beforehand!
 */


import ScriptUtils from "./ScriptUtils";
import {readFileSync, writeFileSync} from "fs";
import {tag} from "@turf/turf";
import {LayerConfigJson} from "../Models/ThemeConfig/Json/LayerConfigJson";

/**
 * In place fix
 */
function fixLayerConfig(config: LayerConfigJson) : void{
    if(config.tagRenderings === undefined){
        return
    }
    
    for (const tagRendering of config.tagRenderings) {
        if(tagRendering["#"] !== undefined){
            tagRendering["id"] = tagRendering["#"]
            delete tagRendering["#"]
        }
        if(tagRendering["id"] === undefined){
            if(tagRendering["freeform"]?.key !== undefined ) {
                tagRendering["id"] = config.id+"-"+tagRendering["freeform"]["key"]
            }
        }
    }
}

const layerFiles = ScriptUtils.getLayerFiles();
for (const layerFile of layerFiles) {
    fixLayerConfig(layerFile.parsed)
    writeFileSync(layerFile.path, JSON.stringify(layerFile.parsed, null, "    "))
}

const themeFiles = ScriptUtils.getThemeFiles()
for (const themeFile of themeFiles) {
    for (const layerConfig of themeFile.parsed.layers ?? []) {
        if(typeof layerConfig === "string" || layerConfig["builtin"]!== undefined){
            continue
        }
        // @ts-ignore
        fixLayerConfig(layerConfig)
    }
    writeFileSync(themeFile.path, JSON.stringify(themeFile.parsed, null, "  "))
}
//*/