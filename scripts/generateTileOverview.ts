/**
 * Generates an overview for which tiles exist and which don't
 */
import ScriptUtils from "./ScriptUtils";
import {Tiles} from "../Models/TileRange";
import {writeFileSync} from "fs";

function main(args: string[]) {

    const directory = args[0]
    let zoomLevel = args[1]
    const files = ScriptUtils.readDirRecSync(directory, 1)
        .filter(f => f.endsWith(".geojson"))

    const indices /* Map<string, number[]>*/ = {}
    for (const path of files) {

        const match = path.match(".*_\([0-9]*\)_\([0-9]*\)_\([0-9]*\).geojson")
        if (match === null) {
            continue
        }
        const z = match[1]
        if(zoomLevel === undefined){
            zoomLevel = z
        }else if(zoomLevel !== z){
            throw "Mixed zoomlevels detected"
        }
        
        const x = match[2]
        const y = match[3]
        if(!indices[x] !== undefined){
            indices[x] = []
        }
        indices[x] .push(Number(y))
    }
    indices["zoom"] = zoomLevel;
    const match = files[0].match("\(.*\)_\([0-9]*\)_\([0-9]*\)_\([0-9]*\).geojson")
    const path = match[1]+"_"+zoomLevel+"_overview.json"
    writeFileSync( path, JSON.stringify(indices))
    console.log("Written overview for", files.length, " tiles at", path)
}

let args = [...process.argv]
args.splice(0, 2)
args.forEach(file => {
    try {
        main(args)
    } catch (e) {
        console.error("Could not handle file ", file, " due to ", e)
    }
})