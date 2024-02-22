import Script from "../Script"
import fs from "fs"
import { Feature, FeatureCollection } from "geojson"
import { GeoOperations } from "../../src/Logic/GeoOperations"
import * as os from "os"
// vite-node scripts/velopark/compare.ts -- scripts/velopark/velopark_all_2024-02-14T12\:18\:41.772Z.geojson ~/Projecten/OSM/Fietsberaad/2024-02-02\ Fietsenstallingen_OSM_met_velopark_ref.geojson
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
        return {
            ref: veloId,
            osmid: osmParking.properties["@id"],
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
            veloparkById[parking.properties[key]] = parking
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

        fs.writeFileSync("report_diff.json", JSON.stringify(diffs))
    }
    constructor() {
        super(
            "Compares a velopark geojson with OSM geojson. Usage: `compare velopark.geojson osm.geojson [key-to-compare-on]`. If key-to-compare-on is not given, `ref:velopark` will be used"
        )
    }
}

new Compare().run()
