
/*
 * This script reads all theme and layer files and reformats them inplace
 * Use with caution, make a commit beforehand!
 */


import ScriptUtils from "./ScriptUtils";
import {readFileSync, writeFileSync} from "fs";
import {tag} from "@turf/turf";

const layerFiles = ScriptUtils.getLayerFiles();
for (const layerFile of layerFiles) {
    console.log("Handling ", layerFile.path)

    for (const tagRendering of layerFile.parsed.tagRenderings) {
        if(tagRendering["#"] !== undefined){
            tagRendering["id"] = tagRendering["#"]
            delete tagRendering["#"]
        }
        if(tagRendering["id"] === undefined){
            if(tagRendering["freeform"]?.key !== undefined ) {
                tagRendering["id"] = layerFile.parsed.id+"-"+tagRendering["freeform"]["key"]
            }
        }
    }
    
    
    writeFileSync(layerFile.path, JSON.stringify(layerFile.parsed, null, "    "))
}