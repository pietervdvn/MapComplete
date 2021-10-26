import * as fs from "fs";
import TiledFeatureSource from "../Logic/FeatureSource/TiledFeatureSource/TiledFeatureSource";
import StaticFeatureSource from "../Logic/FeatureSource/Sources/StaticFeatureSource";
import * as readline from "readline";
import ScriptUtils from "./ScriptUtils";

async function main(args: string[]) {

    console.log("GeoJSON slicer")
    if (args.length < 3) {
        console.log("USAGE: <input-file.line-delimited-geojson> <target-zoom-level> <output-directory>")
        return
    }

    const inputFile = args[0]
    const zoomlevel = Number(args[1])
    const outputDirectory = args[2]

    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory)
        console.log("Directory created")
    }
    console.log("Using directory ", outputDirectory)


    const fileStream = fs.createReadStream(inputFile);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.

    const allFeatures = []
    // @ts-ignore
    for await (const line of rl) {
        // Each line in input.txt will be successively available here as `line`.
        try{
            allFeatures.push(JSON.parse(line))
        }catch (e) {
            console.error("Could not parse", line)
            break
        }
        if(allFeatures.length % 10000 === 0){
            ScriptUtils.erasableLog("Loaded ", allFeatures.length, "features up till now")
        }
    }
    
    console.log("Loaded all", allFeatures.length, "points")
   
    const keysToRemove = ["ID","STRAATNMID","NISCODE","GEMEENTE","POSTCODE","HERKOMST","APPTNR"]
    for (const f of allFeatures) {
        for (const keyToRm of keysToRemove) {
            delete f.properties[keyToRm]
        }
    }
    
    //const knownKeys = Utils.Dedup([].concat(...allFeatures.map(f => Object.keys(f.properties))))
    //console.log("Kept keys: ", knownKeys)

    TiledFeatureSource.createHierarchy(
        new StaticFeatureSource(allFeatures, false),
        {
            minZoomLevel: zoomlevel,
            maxZoomLevel: zoomlevel,
            maxFeatureCount: Number.MAX_VALUE,
            registerTile: tile => {
                const path = `${outputDirectory}/tile_${tile.z}_${tile.x}_${tile.y}.geojson`
                fs.writeFileSync(path, JSON.stringify({
                    "type": "FeatureCollection",
                    "features": tile.features.data.map(ff => ff.feature)
                }, null, "  "))
                console.log("Written ", path, "which has ", tile.features.data.length, "features")
            }
        }
    )

}

let args = [...process.argv]
args.splice(0, 2)
main(args).then(_ => {
    console.log("All done!")
});
