import Script from "../Script"
import fs from "fs"
import { Feature, FeatureCollection } from "geojson"
import { GeoOperations } from "../../src/Logic/GeoOperations"

// vite-node scripts/velopark/compare.ts -- velopark_all.geojson osm_with_velopark_link_.geojson
class Compare extends Script {
    compare(
        veloId: string,
        osmParking: Feature,
        veloParking: Feature
    ): {
        distance: number
        ref: string
        osmid: string
        diffs: {
            osm: string
            velopark: string
            key: string
        }[]
    } {
        const osmCenterpoint = GeoOperations.centerpointCoordinates(osmParking)
        const veloparkCenterpoint = GeoOperations.centerpointCoordinates(veloParking)
        const distance = Math.round(
            GeoOperations.distanceBetween(osmCenterpoint, veloparkCenterpoint)
        )
        const diffs: { osm: string; velopark: string; key: string }[] = []

        const allKeys = new Set<string>(
            Object.keys(osmParking.properties).concat(Object.keys(veloParking.properties))
        )
        for (const key of allKeys) {
            if (["name", "numberOfLevels"].indexOf(key) >= 0) {
                continue // We don't care about these tags
            }
            if (osmParking.properties[key] === veloParking.properties[key]) {
                continue
            }
            if (Number(osmParking.properties[key]) === veloParking.properties[key]) {
                continue
            }
            if (veloParking.properties[key] === undefined) {
                continue
            }
            diffs.push({
                key,
                osm: osmParking.properties[key],
                velopark: veloParking.properties[key],
            })
        }
        let osmid =
            osmParking.properties["@id"] ??
            osmParking["id"] /*Not in the properties, that is how overpass returns it*/
        if (!osmid.startsWith("http")) {
            osmid = "https://openstreetmap.org/" + osmid
        }

        return {
            ref: veloId,
            osmid,
            distance,
            diffs,
        }
    }

    async main(args: string[]): Promise<void> {
        let [velopark, osm, key] = args
        key ??= "ref:velopark"
        const veloparkData: FeatureCollection = JSON.parse(fs.readFileSync(velopark, "utf-8"))
        const osmData: FeatureCollection = JSON.parse(fs.readFileSync(osm, "utf-8"))

        const veloparkById: Record<string, Feature> = {}
        for (const parking of veloparkData.features) {
            veloparkById[parking.properties[key] ?? parking.properties.url] = parking
        }

        const diffs = []
        for (const parking of osmData.features) {
            const veloId = parking.properties[key]
            const veloparking = veloparkById[veloId]
            if (veloparking === undefined) {
                console.error("No velopark entry found for", veloId)
                continue
            }
            diffs.push(this.compare(veloId, parking, veloparking))
        }
        console.log(
            "Found ",
            diffs.length,
            " items with differences between OSM and the provided data"
        )

        const maxDistance = Math.max(...diffs.map((d) => d.distance))
        const distanceBins = []
        const binSize = 5
        for (let i = 0; i < Math.ceil(maxDistance / binSize); i++) {
            distanceBins.push(0)
        }
        for (const diff of diffs) {
            const bin = Math.floor(diff.distance / binSize)
            distanceBins[bin] += 1
        }

        fs.writeFileSync("report_diff.json", JSON.stringify({ diffs, distanceBins }, null, "  "))
        console.log("Written report_diff.json")
    }

    constructor() {
        super(
            "Compares a velopark geojson with OSM geojson. Usage: `compare velopark.geojson osm.geojson [key-to-compare-on]`. If key-to-compare-on is not given, `ref:velopark` will be used"
        )
    }
}

new Compare().run()
