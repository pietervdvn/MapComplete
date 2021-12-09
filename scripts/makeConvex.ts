import fs from "fs";
import {GeoOperations} from "../Logic/GeoOperations";
import ScriptUtils from "./ScriptUtils";

/**
 * Given one of more files, calculates a somewhat convex hull for them
 * @param file
 */

function makeConvex(file) {
    ScriptUtils.erasableLog("Handling", file)
    const geoJson = JSON.parse(fs.readFileSync(file, "UTF8"))
    const convex = GeoOperations.convexHull(geoJson, {concavity: 2})
    if (convex.properties === undefined) {
        convex.properties = {}
    }
    fs.writeFileSync(file + ".convex.geojson", JSON.stringify(convex))

}


let args = [...process.argv]
args.splice(0, 2)
args.forEach(file => {
    try {
        makeConvex(file)
    } catch (e) {
        console.error("Could not handle file ", file, " due to ", e)
    }
})