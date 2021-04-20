

// Loads a geojson file downloaded from overpass, renames "@id" to "id" and deletes "@relations"

import {readFileSync, writeFileSync} from "fs";

const source = process.argv[2] ?? "~/Downloads/export.json"
console.log("Fixing up ", source)
const contents = readFileSync(source, "UTF8");
const f = JSON.parse(contents);
let i = 0
for (const feature of f.features) {
    if(feature.properties == undefined){
        continue
    }
    feature.properties["id"] = feature.properties["@id"]
    feature.properties["@id"] = undefined
    feature.properties["@relations"] = undefined
}

writeFileSync(source+".fixed", JSON.stringify(f, null, "  "))