import {appendFileSync, existsSync, readFileSync, writeFileSync} from "fs";
import {GeoOperations} from "../../Logic/GeoOperations";
import ScriptUtils from "../ScriptUtils";
import {Utils} from "../../Utils";


async function main(args: string[]) {
ScriptUtils.fixUtils()
    const pointCandidates = JSON.parse(readFileSync(args[0], "utf8"))
    const postcodes = JSON.parse(readFileSync(args[1], "utf8"))
    const output = args[2] ?? "centralCoordinates.csv"

    const perPostCode = new Map<string, any[]>()

    const alreadyLoaded = new Set<number>()
    if (existsSync(output)) {
        const lines = readFileSync(output, "UTF8").split("\n")
        lines.shift()
        lines.forEach(line => {
            const postalCode = Number(line.split(",")[0])
            alreadyLoaded.add(postalCode)
        })
    } else {
        writeFileSync(output, "postal_code,lon,lat\n", "UTF-8")
    }

    for (const boundary of postcodes.features) {
        const postcode = boundary.properties.nouveau_PO
        if (alreadyLoaded.has(Number(postcode))) {
            console.log("Skipping ", postcode, "as already loaded")
            continue
        }
        if (perPostCode.has(postcode)) {
            perPostCode.get(postcode).push(boundary)
        } else {
            perPostCode.set(postcode, [boundary])
        }

    }

    for (const postcode of Array.from(perPostCode.keys())) {
        const boundaries = perPostCode.get(postcode)
        const candidates = []
        for (const boundary of boundaries) {
            for (const candidate of pointCandidates.features) {
                if (!GeoOperations.inside(candidate, boundary)) {
                    // console.log(JSON.stringify(candidate))
                    continue
                }
                candidates.push(candidate.geometry.coordinates)

            }
        }
        if (candidates.length === 0) {
            console.log("Postcode ", postcode, "has", candidates.length, "candidates, using centerpoint instead")
            candidates.push(...boundaries.map(boundary => GeoOperations.centerpointCoordinates(boundary)))
        }


        const url = "https://staging.anyways.eu/routing-api/v1/routes?access_token=postal_code_script&turn_by_turn=false&format=geojson&language=en"
        const depPoints: [number, number][] = Utils.NoNull(await Promise.all(candidates.map(async candidate => {
            try {

                const result = await Utils.downloadJson(url + "&loc=" + candidate.join("%2C") + "&loc=3.22000%2C51.21577&profile=car.short")
                const depPoint = result.features.filter(f => f.geometry.type === "LineString")[0].geometry.coordinates[0]
                return <[number, number]>[depPoint[0], depPoint[1]] // Drop elevation
            } catch (e) {
                console.error("No result or could not calculate a route")
            }
        })))

        const centers = boundaries.map(b => GeoOperations.centerpointCoordinates(b))
        const center = GeoOperations.centerpointCoordinates({
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: centers
            }
        })

        depPoints.sort((c0, c1) => GeoOperations.distanceBetween(c0, center) - GeoOperations.distanceBetween(c1, center))
        console.log("Sorted departure point candidates for ", postcode, " are ", JSON.stringify(depPoints))
        appendFileSync(output, [postcode, ...depPoints[0]].join(", ") + "\n", "UTF-8")
    }


}


let args = [...process.argv]
args.splice(0, 2)
main(args).then(_ => console.log("Done!"))