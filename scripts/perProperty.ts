import * as fs from "fs";

function main(args) {
    if (args.length < 2) {
        console.log("Given a single geojson file, generates the partitions for every found property")
        console.log("USAGE: perProperty `file.geojson` `property-key`")
        return
    }
    const path = args[0]
    const key = args[1]

    const data = JSON.parse(fs.readFileSync(path, "UTF8"))
    const perProperty = new Map<string, any[]>()

    console.log("Partitioning", data.features.length, "features")
    for (const feature of data.features) {
        const v = feature.properties[key]
        if (!perProperty.has(v)) {
            console.log("Found a new category:", v)
            perProperty.set(v, [])
        }
        perProperty.get(v).push(feature)
    }

    const stripped = path.substr(0, path.length - ".geojson".length)
    perProperty.forEach((features, v) => {

        fs.writeFileSync(stripped + "." + v.replace(/[^a-zA-Z0-9_]/g, "_") + ".geojson",
            JSON.stringify({
                type: "FeatureCollection",
                features
            }))
    })


}

let args = [...process.argv]
args.splice(0, 2)
try {
    main(args)
} catch (e) {
    console.error("Error building cache:", e)
}
console.log("All done!")