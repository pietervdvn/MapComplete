import { parse } from "csv-parse/sync"
import { readFileSync } from "fs"

var lambert72toWGS84 = function (x, y) {
    var newLongitude, newLatitude

    var n = 0.77164219,
        F = 1.81329763,
        thetaFudge = 0.00014204,
        e = 0.08199189,
        a = 6378388,
        xDiff = 149910,
        yDiff = 5400150,
        theta0 = 0.07604294

    var xReal = xDiff - x,
        yReal = yDiff - y

    var rho = Math.sqrt(xReal * xReal + yReal * yReal),
        theta = Math.atan(xReal / -yReal)

    newLongitude = ((theta0 + (theta + thetaFudge) / n) * 180) / Math.PI
    newLatitude = 0

    for (var i = 0; i < 5; ++i) {
        newLatitude =
            2 *
                Math.atan(
                    Math.pow((F * a) / rho, 1 / n) *
                        Math.pow(
                            (1 + e * Math.sin(newLatitude)) / (1 - e * Math.sin(newLatitude)),
                            e / 2
                        )
                ) -
            Math.PI / 2
    }
    newLatitude *= 180 / Math.PI
    return [newLongitude, newLatitude]
}

function main(args: string[]): void {
    if (args.length == 0) {
        /*     args = ["/home/pietervdvn/Downloads/Scholen/aantallen.csv",
            "/home/pietervdvn/Downloads/Scholen/perschool.csv",
            "/home/pietervdvn/Downloads/Scholen/Vestigingsplaatsen-van-scholen-gewoon-secundair-onderwijs-cleaned.csv"]
    */
        console.log("Usage: csvToGeojson input.csv name-of-lat-field name-of-lon-field")
        return
    }

    let file = args[0]
    if (file.startsWith("file://")) {
        file = file.substr("file://".length)
    }
    const latField = args[1]
    const lonField = args[2]

    const csvOptions = {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    }

    const csv: Record<any, string>[] = parse(readFileSync(file), csvOptions)

    const features = csv.map((csvElement, i) => {
        const lat = Number(csvElement[latField])
        const lon = Number(csvElement[lonField])
        if (isNaN(lat) || isNaN(lon)) {
            throw `Not a valid lat or lon for entry ${i}: ${JSON.stringify(csvElement)}`
        }

        return {
            type: "Feature",
            properties: csvElement,
            geometry: {
                type: "Point",
                coordinates: lambert72toWGS84(lon, lat),
            },
        }
    })

    console.log(
        JSON.stringify({
            type: "FeatureCollection",
            features,
        })
    )
}

main(process.argv.slice(2))
