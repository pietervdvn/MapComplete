import Script from "../Script"
import { Utils } from "../../src/Utils"
import VeloparkLoader, { VeloparkData } from "../../src/Logic/Web/VeloparkLoader"
import fs from "fs"
import { Overpass } from "../../src/Logic/Osm/Overpass"
import { RegexTag } from "../../src/Logic/Tags/RegexTag"
import Constants from "../../src/Models/Constants"
import { ImmutableStore } from "../../src/Logic/UIEventSource"
import { BBox } from "../../src/Logic/BBox"

class VeloParkToGeojson extends Script {
    constructor() {
        super(
            "Downloads the latest Velopark data and converts it to a geojson, which will be saved at the current directory"
        )
    }

    exportTo(filename: string, features) {
        fs.writeFileSync(
            filename + "_" + new Date().toISOString() + ".geojson",
            JSON.stringify(
                {
                    type: "FeatureCollection",
                    features,
                },
                null,
                "    "
            )
        )
    }

    async main(args: string[]): Promise<void> {
        console.log("Downloading velopark data")
        // Download data for NIS-code 1000. 1000 means: all of belgium
        const url = "https://www.velopark.be/api/parkings/1000"
        const data = <VeloparkData[]>await Utils.downloadJson(url)

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
        const alreadyLinkedFeatures = await alreadyLinkedQuery.queryGeoJson(bboxBelgium)
        const seenIds = new Set<string>(
            alreadyLinkedFeatures[0].features.map((f) => f.properties["ref:velopark"])
        )
        console.log("OpenStreetMap contains", seenIds.size, "bicycle parkings with a velopark ref")
        const allVelopark = data.map((f) => VeloparkLoader.convert(f))
        this.exportTo("velopark_all", allVelopark)

        const features = allVelopark.filter((f) => !seenIds.has(f.properties["ref:velopark"]))

        const allProperties = new Set<string>()
        for (const feature of features) {
            Object.keys(feature.properties).forEach((k) => allProperties.add(k))
        }
        this.exportTo("velopark_noncynced", features)
        allProperties.delete("ref:velopark")
        for (const feature of features) {
            allProperties.forEach((k) => {
                delete feature.properties[k]
            })
        }

        this.exportTo("velopark_nonsynced_id_only", features)
    }
}

new VeloParkToGeojson().run()
