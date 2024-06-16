import Script from "../Script"
import fs from "fs"
import LinkedDataLoader from "../../src/Logic/Web/LinkedDataLoader"
import { Utils } from "../../src/Utils"
import { Feature } from "geojson"
import { BBox } from "../../src/Logic/BBox"
import { Overpass } from "../../src/Logic/Osm/Overpass"
import { RegexTag } from "../../src/Logic/Tags/RegexTag"
import { ImmutableStore } from "../../src/Logic/UIEventSource"
import Constants from "../../src/Models/Constants"

class VeloParkToGeojson extends Script {
    constructor() {
        super(
            "Downloads the latest Velopark data and converts it to a geojson, which will be saved at the current directory"
        )
    }

    private static exportGeojsonTo(filename: string, features: Feature[], extension = ".geojson") {
        const file = filename + "_" + /*new Date().toISOString() + */ extension
        fs.writeFileSync(
            file,
            JSON.stringify(
                extension === ".geojson"
                    ? {
                          type: "FeatureCollection",
                          features,
                      }
                    : features,
                null,
                "    "
            )
        )
        console.log("Written", file, "(" + features.length, " features)")
    }

    private static async downloadDataFor(url: string): Promise<Feature[]> {
        const cachePath =
            "/home/pietervdvn/data/velopark_cache_refined/" + url.replace(/[/:.]/g, "_")
        if (fs.existsSync(cachePath)) {
            return JSON.parse(fs.readFileSync(cachePath, "utf8"))
        }
        console.log("Fetching data for", url)

        const linkedData = await LinkedDataLoader.fetchVeloparkEntry(url)
        const allVelopark: Feature[] = []
        for (const sectionId in linkedData) {
            const sectionInfo = linkedData[sectionId]
            if (Object.keys(sectionInfo).length === 0) {
                console.warn("No result for", url)
            }
            if (!sectionInfo.geometry?.coordinates) {
                throw "Invalid properties!"
            }
            allVelopark.push(sectionInfo)
        }
        fs.writeFileSync(cachePath, JSON.stringify(allVelopark), "utf8")
        return allVelopark
    }

    private static async downloadData() {
        console.log("Downloading velopark data")
        // Download data for NIS-code 1000. 1000 means: all of belgium
        const url = "https://www.velopark.be/api/parkings/1000"
        const allVeloparkRaw: { url: string }[] = <{ url: string }[]>await Utils.downloadJson(url)

        let failed = 0
        console.log("Got", allVeloparkRaw.length, "items")
        const allVelopark: Feature[] = []
        const batchSize = 50
        for (let i = 0; i < allVeloparkRaw.length; i += batchSize) {
            await Promise.all(
                Utils.TimesT(batchSize, (j) => j).map(async (j) => {
                    const f = allVeloparkRaw[i + j]
                    if (!f) {
                        return
                    }
                    try {
                        const sections: Feature[] = await VeloParkToGeojson.downloadDataFor(f.url)
                        allVelopark.push(...sections)
                    } catch (e) {
                        console.error("Loading ", f.url, " failed due to", e)
                        failed++
                    }
                })
            )
        }
        console.log(
            "Fetching data done, got ",
            allVelopark.length + "/" + allVeloparkRaw.length,
            "failed:",
            failed
        )
        VeloParkToGeojson.exportGeojsonTo("velopark_all", allVelopark)

        return allVelopark
    }

    private static loadFromFile(maxCacheAgeSeconds = 24 * 60 * 60): Feature[] | null {
        const path = "velopark_all.geojson"
        if (!fs.existsSync(path)) {
            return null
        }
        // Millis since epoch
        const mtime: number = fs.statSync(path).mtime.getTime()
        const stalenessSeconds = (new Date().getTime() - mtime) / 1000
        if (stalenessSeconds > maxCacheAgeSeconds) {
            return null
        }

        return JSON.parse(fs.readFileSync(path, "utf-8")).features
    }

    private static exportExtraAmenities(allVelopark: Feature[]) {
        const amenities: Record<string, Feature[]> = {}

        for (const bikeparking of allVelopark) {
            const props = bikeparking.properties
            if (!props["fixme_nearby_amenity"]) {
                continue
            }
            if (props["fixme_nearby_amenity"]?.endsWith("CameraSurveillance")) {
                delete props["fixme_nearby_amenity"]
                continue
            }
            const amenity = props["fixme_nearby_amenity"].split("#")[1]
            if (!amenities[amenity]) {
                amenities[amenity] = []
            }
            amenities[amenity].push(bikeparking)
        }

        for (const k in amenities) {
            this.exportGeojsonTo("velopark_amenity_" + k + ".geojson", amenities[k])
        }
    }

    private static async createDiff(allVelopark: Feature[]) {
        const bboxBelgium = new BBox([
            [2.51357303225, 49.5294835476],
            [6.15665815596, 51.4750237087],
        ])

        const alreadyLinkedQuery = new Overpass(
            new RegexTag("ref:velopark", /.+/),
            [],
            Constants.defaultOverpassUrls[0],
            new ImmutableStore(60 * 5),
            false
        )
        const alreadyLinkedFeatures = (await alreadyLinkedQuery.queryGeoJson(bboxBelgium))[0]
        const seenIds = new Set<string>(
            alreadyLinkedFeatures.features.map((f) => f.properties?.["ref:velopark"])
        )
        this.exportGeojsonTo("osm_with_velopark_link", <Feature[]>alreadyLinkedFeatures.features)
        console.log("OpenStreetMap contains", seenIds.size, "bicycle parkings with a velopark ref")

        const features: Feature[] = allVelopark.filter(
            (f) => !seenIds.has(f.properties["ref:velopark"])
        )
        VeloParkToGeojson.exportGeojsonTo("velopark_nonsynced", features)

        const allProperties = new Set<string>()
        for (const feature of features) {
            Object.keys(feature).forEach((k) => allProperties.add(k))
        }
        allProperties.delete("ref:velopark")
        for (const feature of features) {
            allProperties.forEach((k) => {
                delete feature[k]
            })
        }

        this.exportGeojsonTo("velopark_nonsynced_id_only", features)
    }

    async main(): Promise<void> {
        const allVelopark =
            VeloParkToGeojson.loadFromFile() ?? (await VeloParkToGeojson.downloadData())
        console.log("Got", allVelopark.length, " items")
        VeloParkToGeojson.exportExtraAmenities(allVelopark)
        await VeloParkToGeojson.createDiff(allVelopark)
        console.log(
            "Use vite-node scripts/velopark/compare.ts to compare the results and generate a diff file"
        )
    }
}

new VeloParkToGeojson().run()
