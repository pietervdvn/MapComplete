import * as fs from "fs";
import TiledFeatureSource from "../Logic/FeatureSource/TiledFeatureSource/TiledFeatureSource";
import StaticFeatureSource from "../Logic/FeatureSource/Sources/StaticFeatureSource";
import * as readline from "readline";
import ScriptUtils from "./ScriptUtils";
import {Utils} from "../Utils";

/**
 * This script slices a big newline-delimeted geojson file into tiled geojson 
 * It was used to convert the CRAB-data into geojson tiles
 */

async function readFeaturesFromLineDelimitedJsonFile(inputFile: string): Promise<any[]> {
    const fileStream = fs.createReadStream(inputFile);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.

    const allFeatures: any[] = []
    // @ts-ignore
    for await (const line of rl) {
        try {
            allFeatures.push(JSON.parse(line))
        } catch (e) {
            console.error("Could not parse", line)
            break
        }
        if (allFeatures.length % 10000 === 0) {
            ScriptUtils.erasableLog("Loaded ", allFeatures.length, "features up till now")
        }
    }
    return allFeatures
}

async function readGeojsonLineByLine(inputFile: string): Promise<any[]> {
    const fileStream = fs.createReadStream(inputFile);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.

    const allFeatures: any[] = []
    let featuresSeen = false
    // @ts-ignore
    for await (let line: string of rl) {
        if (!featuresSeen && line.startsWith("\"features\":")) {
            featuresSeen = true;
            continue;
        }
        if (!featuresSeen) {
            continue
        }
        if (line.endsWith(",")) {
            line = line.substring(0, line.length - 1)
        }

        try {
            allFeatures.push(JSON.parse(line))
        } catch (e) {
            console.error("Could not parse", line)
            break
        }
        if (allFeatures.length % 10000 === 0) {
            ScriptUtils.erasableLog("Loaded ", allFeatures.length, "features up till now")
        }
    }
    return allFeatures
}

async function readFeaturesFromGeoJson(inputFile: string): Promise<any[]> {
    try {
        return JSON.parse(fs.readFileSync(inputFile, "UTF-8")).features
    } catch (e) {
        // We retry, but with a line-by-line approach
        return await readGeojsonLineByLine(inputFile)
    }
}

async function main(args: string[]) {

    console.log("GeoJSON slicer")
    if (args.length < 3) {
        console.log("USAGE: <input-file.geojson> <target-zoom-level> <output-directory>")
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


    let allFeatures: any [];
    if (inputFile.endsWith(".geojson")) {
        console.log("Detected geojson")
        allFeatures = await readFeaturesFromGeoJson(inputFile)
    } else {
        console.log("Loading as newline-delimited features")
        allFeatures = await readFeaturesFromLineDelimitedJsonFile(inputFile)
    }
    allFeatures = Utils.NoNull(allFeatures)


    console.log("Loaded all", allFeatures.length, "points")

    const keysToRemove = ["STRAATNMID", "GEMEENTE", "POSTCODE"]
    for (const f of allFeatures) {
        if(f.properties === null){
            console.log("Got a feature without properties!", f)
            continue
        }
        for (const keyToRm of keysToRemove) {
            delete f.properties[keyToRm]
        }
        delete f.bbox
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
                const features = tile.features.data.map(ff => ff.feature)
                features.forEach(f => {
                    delete f.bbox
                })
                fs.writeFileSync(path, JSON.stringify({
                    "type": "FeatureCollection",
                    "features": features
                }, null, "  "))
                ScriptUtils.erasableLog("Written ", path, "which has ", tile.features.data.length, "features")
            }
        }
    )

}

let args = [...process.argv]
args.splice(0, 2)
main(args).then(_ => {
    console.log("All done!")
});
