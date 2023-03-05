import Script from "./Script"
import fs from "fs"
import { Feature } from "geojson"
import { GeoOperations } from "../Logic/GeoOperations"
import { Utils } from "../Utils"
import { OsmObject } from "../Logic/Osm/OsmObject"

export class Conflate extends Script {
    constructor() {
        super(
            [
                "Conflation script",
                "",
                "This script is meant to be used to prepare imports. It takes one 'OSM'-dataset and one external dataset and tries to find an OSM-id for every external item.",
                "",
                "Arguments:",
                "osm_file.geojson external_file.geojson [search_range]",
                "- osm_file.geojson: a file exported from overpass, including meta (note: filename MUST contain either OSM or OpenStreetMap)",
                "- external_file.geojson: the data to import. Tags should be prepared to have an OSM-name",
                "- search_range: max distance at which a match will occur",
            ].join("\n")
        )
    }

    private async findTimeFork(
        externalName: string,
        osmName: string,
        osmId: string
    ): Promise<{ earliestDateOfImport; latestDateOfImport }> {
        const history = await OsmObject.DownloadHistory(osmId).AsPromise((h) => h.length > 0)
        let earliest: Date = undefined
        let latest: Date = undefined
        for (const historyElement of history) {
            const csTime = new Date(historyElement.tags["_last_edit:timestamp"])
            if (isNaN(csTime.getTime())) {
                console.error("Could not parse" + historyElement.tags["_last_edit:timestamp"])
                return undefined
            }
            const nameIdentical = historyElement.tags.name === externalName
            if (nameIdentical) {
                if (earliest == undefined) {
                    earliest = csTime
                }
                latest = csTime
            }
        }

        if (history.at(-1).tags.name === externalName) {
            // Not changed yet, so no actual hint about when this import could have happened
            latest = new Date()
        }

        if (this.earliestDate === undefined || earliest?.getTime() > this.earliestDate?.getTime()) {
            this.earliestDate = earliest
        }
        if (this.latestDate === undefined || latest?.getTime() < this.latestDate?.getTime()) {
            this.latestDate = latest
        }

        return { earliestDateOfImport: earliest, latestDateOfImport: latest }
    }

    private earliestDate: Date = undefined
    private latestDate: Date = undefined

    async main(args: string[]): Promise<void> {
        const [osm_file_path, external_file_path] = args
        let max_range = 50
        if (args.length === 3) {
            max_range = Number(args[2])
        }
        if (
            osm_file_path.toLowerCase().indexOf("osm") < 0 &&
            osm_file_path.toLowerCase().indexOf("openstreetmap") < 0
        ) {
            throw "OSM File path must contain 'osm' or 'openStreetMap'"
        }

        if (
            external_file_path.toLowerCase().indexOf("osm") >= 0 ||
            external_file_path.toLowerCase().indexOf("openstreetmap") >= 0
        ) {
            throw "External File path may not contain 'osm' or 'openStreetMap'"
        }

        const external_features: Feature[] = JSON.parse(
            fs.readFileSync(external_file_path, { encoding: "utf-8" })
        ).features
        const osm_features: Feature[] = JSON.parse(
            fs.readFileSync(osm_file_path, { encoding: "utf-8" })
        ).features

        const match_lengths: (string | number)[][] = [
            [
                "osm_id",
                "external_index",
                "match_distance",
                "name_levenshtein_distance",
                "osm_data",
                "external_data",
                "status",
            ],
        ]
        for (let i = 0; i < external_features.length; i++) {
            // console.log("Inspecting " + (i + 1) + "/" + external_features.length)
            const externalFeature = external_features[i]
            const possibleMatches: number[] = []
            for (const osmFeature of osm_features) {
                const d = GeoOperations.distanceBetween(
                    GeoOperations.centerpointCoordinates(externalFeature),
                    GeoOperations.centerpointCoordinates(osmFeature)
                )

                if (d === 0) {
                    console.log(
                        "Found an exact match (name match: ",
                        osmFeature.properties.name === externalFeature.properties.name,
                        osmFeature.properties.name,
                        externalFeature.properties.name
                    )
                    continue
                }
                continue
                if (d < max_range) {
                    console.log("Found a match")
                    match_lengths.push([
                        osmFeature.properties["@id"],
                        (i + " " + possibleMatches.join(",")).trim(),
                        d,
                        this.levenshteinDistancePharmacy(
                            externalFeature.properties.name,
                            osmFeature.properties.name
                        ),
                        externalFeature.properties.status,
                        ...this.conflate(osmFeature.properties, externalFeature.properties),
                    ])
                    possibleMatches.push(osmFeature.properties["@id"])
                    /*
                    possibleMatches.push({
                        osmFeature,
                        d,
                        nameDist: Utils.levenshteinDistance(
                            osmFeature.properties.name,
                            externalFeature.properties.name
                        ),
                    })//*/
                }
                // possibleMatches.sort((a, b) => b.d - a.d)
            }
        }
        match_lengths.sort((a, b) => <number>b[1] - <number>a[1])
        console.log(
            "The import probably happened between ",
            this.earliestDate?.toISOString(),
            "and",
            this.latestDate?.toISOString()
        )
        fs.writeFileSync(
            "../onwheels-data-prep/match_lengths.tsv",
            match_lengths.map((l) => l.join("\t")).join("\n")
        )
        console.log(match_lengths)
    }

    private levenshteinDistancePharmacy(a?: string, b?: string) {
        a ??= ""
        b ??= ""
        a = a.toLowerCase()
        b = b.toLowerCase()
        return Math.min(
            ...["", "pharmacie", "apotheek", "pharmacie de", "apotheke"].map((prefix) =>
                Math.min(
                    Utils.levenshteinDistance(a, prefix + b),
                    Utils.levenshteinDistance(prefix + a, b)
                )
            )
        )
    }

    private conflate(
        osmFeature: Record<string, string>,
        externalFeature: Record<string, string>
    ): string[] {
        const r: string[] = []

        for (const externalFeatureKey in externalFeature) {
            if (
                [
                    "status",
                    "healthcare",
                    "unmeasurable_reason",
                    "timestamp_created",
                    "timestamp_last_modified",
                ].indexOf(externalFeatureKey) >= 0
            ) {
                continue
            }
            const v = externalFeature[externalFeatureKey]
            const osmV = osmFeature[externalFeatureKey]
            if (osmV === undefined) {
                r.push("+" + externalFeatureKey + "=" + v)
            } else if (osmV !== v) {
                r.push("~" + externalFeatureKey + "=" + v + " (osm: " + osmV + ")")
            }
        }

        return r.map((l) => l.replace(/\n/g, "\\n"))
    }
}

new Conflate().run()
