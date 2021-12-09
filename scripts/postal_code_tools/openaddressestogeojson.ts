import * as fs from "fs";
import {existsSync, writeFileSync} from "fs";
import * as readline from "readline";
import ScriptUtils from "../ScriptUtils";

/**
 * Converts an open-address CSV file into a big geojson file
 */

async function main(args: string[]) {

    const inputFile = args[0]
    const outputFile = args[1]
    const fileStream = fs.createReadStream(inputFile);
    const perPostalCode = args[2] == "--per-postal-code"
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.

    const fields = [
        "EPSG:31370_x", "EPSG:31370_y", "EPSG:4326_lat", "EPSG:4326_lon",
        "address_id", "box_number",
        "house_number", "municipality_id", "municipality_name_de", "municipality_name_fr", "municipality_name_nl", "postcode", "postname_fr",
        "postname_nl", "street_id", "streetname_de", "streetname_fr", "streetname_nl", "region_code", "status"
    ]

    let i = 0;
    let failed = 0
    
    let createdFiles : string [] = []
    if(!perPostalCode){
        fs.writeFileSync(outputFile, "")
    }
    // @ts-ignore
    for await (const line of rl) {
        i++;
        if (i % 10000 == 0) {
            ScriptUtils.erasableLog("Converted ", i, "features (of which ", failed, "features don't have a coordinate)")
        }
        const data = line.split(",")
        const parsed: any = {}
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            parsed[field] = data[i]
        }
        const lat = Number(parsed["EPSG:4326_lat"])
        const lon = Number(parsed["EPSG:4326_lon"])

        if (parsed["EPSG:31370_x"] === "0.0") {
            failed++
            continue
        }

        delete parsed["EPSG:4326_lat"]
        delete parsed["EPSG:4326_lon"]
        delete parsed["EPSG:31370_x"]
        delete parsed["EPSG:31370_y"]
        delete parsed["EPSG:4326_lat"]
        delete parsed["EPSG:4326_lat"]

        let targetFile = outputFile
        if (perPostalCode) {
            if(parsed["postcode"] === ""){
                continue
            }
            if(isNaN(Number(parsed["postcode"]))){
                continue;
            }
            targetFile = outputFile + "-" + parsed["postcode"] + ".geojson"
            let isFirst = false
            if(!existsSync(targetFile)){
                writeFileSync(targetFile, '{ "type":"FeatureCollection", "features":[')
                createdFiles.push(targetFile)
                isFirst = true
            }
            
            if(!isFirst){
                fs.appendFileSync(targetFile, ",\n")
            }

            fs.appendFileSync(targetFile, JSON.stringify({
                type: "Feature",
                properties: parsed,
                geometry: {
                    type: "Point",
                    coordinates: [lon, lat]
                }
            }))
            
        }else{
            

        fs.appendFileSync(outputFile, JSON.stringify({
            type: "Feature",
            properties: parsed,
            geometry: {
                type: "Point",
                coordinates: [lon, lat]
            }
        }) + "\n")
        }
        

    }

    console.log("Closing files...")
    createdFiles.sort()
    for (const createdFile of createdFiles) {
        ScriptUtils.erasableLog("Closing ", createdFile, "and creating convex hull")
        fs.appendFileSync(createdFile, "]}")
    }
    
    console.log("Done! Converted ", i, "features (of which ", failed, "features don't have a coordinate)")

}

let args = [...process.argv]
args.splice(0, 2)

if (args.length == 0) {
    console.log("USAGE: input-csv-file output.newline-delimited-geojson.json [--per-postal-code]")
} else {
    main(args).catch(e => console.error(e))
}
