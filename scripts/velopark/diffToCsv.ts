import Script from "../Script"
import { readFileSync, writeFileSync } from "fs"
import { OsmId } from "../../src/Models/OsmFeature"
import { Utils } from "../../src/Utils"

interface DiffItem {
    /**
     * Velopark-id
     */
    ref: string
    osmid: OsmId
    distance: number
    diffs: {
        key: string
        /**
         * The value in OpenStreetMap
         * Might be undefined if OSM doesn't have an appropriate value
         */
        osm?: string
        velopark: string | number
    }[]
}

export class DiffToCsv extends Script {
    constructor() {
        super(
            "Converts a 'report.diff' to a CSV file for people who prefer LibreOffice Calc (or other Spreadsheet Software)"
        )
    }

    async main(args: string[]): Promise<void> {
        const file = args[0] ?? "report_diff.json"
        const json = <{ diffs: DiffItem[]; distanceBinds: number[] }>(
            JSON.parse(readFileSync(file, "utf8"))
        )
        const diffs = json.diffs
        const allKeys = Utils.Dedup(diffs.flatMap((item) => item.diffs.map((d) => d.key)))
        allKeys.sort()

        const header = [
            "osm_id",
            "velopark_id",
            "distance",
            ...allKeys.flatMap((k) => ["osm:" + k, "velopark:" + k]),
        ]
        const lines = [header]
        for (const diffItem of diffs) {
            const line = []
            lines.push(line)
            line.push(diffItem.osmid)
            line.push(diffItem.ref)
            line.push(diffItem.distance)

            const d = diffItem.diffs
            for (const k of allKeys) {
                const found = d.find((i) => i.key === k)
                if (!found) {
                    line.push("", "")
                    continue
                }
                line.push(found.osm, found.velopark)
            }
        }
        const path = "report_diff.csv"
        writeFileSync(path, lines.map((l) => l.join(",")).join("\n"), "utf8")
        console.log("Written", path)
    }
}

new DiffToCsv().run()
