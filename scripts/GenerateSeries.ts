import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "fs"
import ScriptUtils from "./ScriptUtils"
import { Utils } from "../src/Utils"
import Script from "./Script"
import { GeoOperations } from "../src/Logic/GeoOperations"
import { Feature, Polygon } from "geojson"
import { Tiles } from "../src/Models/TileRange"

class StatsDownloader {
    private readonly urlTemplate =
        "https://osmcha.org/api/v1/changesets/?date__gte={start_date}&date__lte={end_date}&page={page}&comment=%23mapcomplete&page_size=100"

    private readonly _targetDirectory: string

    constructor(targetDirectory = ".") {
        this._targetDirectory = targetDirectory
    }

    public async DownloadStats(startYear = 2020, startMonth = 5, startDay = 1): Promise<void> {
        const today = new Date()
        const currentYear = today.getFullYear()
        const currentMonth = today.getMonth() + 1
        for (let year = startYear; year <= currentYear; year++) {
            for (let month = 1; month <= 12; month++) {
                if (year === startYear && month < startMonth) {
                    continue
                }

                if (year === currentYear && month > currentMonth) {
                    break
                }

                const pathM = `${this._targetDirectory}/stats.${year}-${month}.json`
                if (existsSync(pathM)) {
                    continue
                }

                const features = []
                let monthIsFinished = true
                const writtenFiles = []
                for (let day = startDay; day <= 31; day++) {
                    if (year === currentYear && month === currentMonth && day === today.getDate()) {
                        monthIsFinished = false
                        break
                    }
                    {
                        const date = new Date(year, month - 1, day)
                        if (date.getMonth() != month - 1) {
                            // We did roll over
                            continue
                        }
                    }
                    const path = `${this._targetDirectory}/stats.${year}-${month}-${
                        (day < 10 ? "0" : "") + day
                    }.day.json`
                    writtenFiles.push(path)
                    if (existsSync(path)) {
                        let loadedFeatures = JSON.parse(readFileSync(path, { encoding: "utf-8" }))
                        loadedFeatures = loadedFeatures?.features ?? loadedFeatures
                        features.push(...loadedFeatures) // day-stats are generally a list already, but in some ad-hoc cases might be a geojson-collection too
                        console.log(
                            "Loaded ",
                            path,
                            "from disk, which has",
                            features.length,
                            "features now"
                        )
                        continue
                    }
                    let dayFeatures: any[] = undefined
                    try {
                        dayFeatures = await this.DownloadStatsForDay(year, month, day)
                    } catch (e) {
                        console.error(e)
                        console.error(
                            "Could not download " +
                                year +
                                "-" +
                                month +
                                "-" +
                                day +
                                "... Trying again"
                        )
                        dayFeatures = await this.DownloadStatsForDay(year, month, day)
                    }
                    writeFileSync(path, JSON.stringify(dayFeatures))
                    features.push(...dayFeatures)
                }
                if (monthIsFinished) {
                    writeFileSync(pathM, JSON.stringify({ features }))
                    for (const writtenFile of writtenFiles) {
                        unlinkSync(writtenFile)
                    }
                }
            }
            startDay = 1
        }
    }

    public async DownloadStatsForDay(
        year: number,
        month: number,
        day: number
    ): Promise<ChangeSetData[]> {
        let page = 1
        let allFeatures: ChangeSetData[] = []
        let endDay = new Date(year, month - 1 /* Zero-indexed: 0 = january*/, day + 1)
        let endDate = `${endDay.getFullYear()}-${Utils.TwoDigits(
            endDay.getMonth() + 1
        )}-${Utils.TwoDigits(endDay.getDate())}`
        let url = this.urlTemplate
            .replace(
                "{start_date}",
                year + "-" + Utils.TwoDigits(month) + "-" + Utils.TwoDigits(day)
            )
            .replace("{end_date}", endDate)
            .replace("{page}", "" + page)

        let headers = {
            "User-Agent":
                "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:86.0) Gecko/20100101 Firefox/86.0",
            "Accept-Language": "en-US,en;q=0.5",
            Referer:
                "https://osmcha.org/?filters=%7B%22date__gte%22%3A%5B%7B%22label%22%3A%222020-07-05%22%2C%22value%22%3A%222020-07-05%22%7D%5D%2C%22editor%22%3A%5B%7B%22label%22%3A%22mapcomplete%22%2C%22value%22%3A%22mapcomplete%22%7D%5D%7D",
            "Content-Type": "application/json",
            Authorization: "Token 6e422e2afedb79ef66573982012000281f03dc91",
            DNT: "1",
            Connection: "keep-alive",
            TE: "Trailers",
            Pragma: "no-cache",
            "Cache-Control": "no-cache",
        }

        while (url) {
            ScriptUtils.erasableLog(
                `Downloading stats for ${year}-${month}-${day}, page ${page} ${url}`
            )
            const result = await Utils.downloadJson(url, headers)
            page++
            allFeatures.push(...result.features)
            if (result.features === undefined) {
                console.log("ERROR", result)
                return
            }
            url = result.next
        }
        allFeatures = Utils.NoNull(allFeatures)
        allFeatures.forEach((f) => {
            f.properties = { ...f.properties, ...f.properties.metadata }
            delete f.properties.metadata
            f.properties["id"] = f.id
        })
        return allFeatures
    }
}

interface ChangeSetData extends Feature<Polygon> {
    id: number
    type: "Feature"
    geometry: {
        type: "Polygon"
        coordinates: [number, number][][]
    }
    properties: {
        check_user: null
        reasons: []
        tags: []
        features: []
        user: string
        uid: string
        editor: string
        comment: string
        comments_count: number
        source: string
        imagery_used: string
        date: string
        reviewed_features: []
        create: number
        modify: number
        delete: number
        area: number
        is_suspect: boolean
        harmful: any
        checked: boolean
        check_date: any
        metadata: {
            host: string
            theme: string
            imagery: string
            language: string
        }
    }
}

class GenerateSeries extends Script {
    constructor() {
        super("Downloads metadata about changesets made by MapComplete from OsmCha")
    }

    async main(args: string[]): Promise<void> {
        const targetDir = args[0] ?? "../../git/MapComplete-data"

        await this.downloadStatistics(targetDir + "/changeset-metadata")
        await this.generateCenterPoints(
            targetDir + "/changeset-metadata",
            targetDir + "/mapcomplete-changes/",
            {
                zoomlevel: 8,
            }
        )
    }

    private async downloadStatistics(targetDir: string) {
        let year = 2020
        let month = 5
        let day = 1
        if (!isNaN(Number(process.argv[2]))) {
            year = Number(process.argv[2])
        }
        if (!isNaN(Number(process.argv[3]))) {
            month = Number(process.argv[3])
        }

        if (!isNaN(Number(process.argv[4]))) {
            day = Number(process.argv[4])
        }

        do {
            try {
                await new StatsDownloader(targetDir).DownloadStats(year, month, day)
                break
            } catch (e) {
                console.log(e)
            }
        } while (true)

        const allFiles = readdirSync(targetDir).filter((p) => p.endsWith(".json"))
        writeFileSync(targetDir + "/file-overview.json", JSON.stringify(allFiles))
    }

    private generateCenterPoints(
        sourceDir: string,
        targetDir: string,
        options: {
            zoomlevel: number
        }
    ) {
        const allPaths = readdirSync(sourceDir).filter(
            (p) => p.startsWith("stats.") && p.endsWith(".json")
        )
        let allFeatures: ChangeSetData[] = [].concat(
            ...allPaths.map(
                (path) => JSON.parse(readFileSync(sourceDir + "/" + path, "utf-8")).features
            )
        )
        allFeatures = allFeatures.filter(
            (f) =>
                f?.properties !== undefined &&
                (f.properties.editor === null ||
                    f.properties.editor.toLowerCase().startsWith("mapcomplete"))
        )

        allFeatures = allFeatures.filter(
            (f) => f.geometry !== null && f.properties.metadata?.theme !== "EMPTY CS"
        )
        allFeatures = allFeatures.filter(
            (f) =>
                f?.properties !== undefined &&
                (f.properties.editor === null ||
                    f.properties.editor.toLowerCase().startsWith("mapcomplete"))
        )

        allFeatures = allFeatures.filter((f) => f.properties.metadata?.theme !== "EMPTY CS")
        const centerpoints = allFeatures.map((f) => GeoOperations.centerpoint(f))
        console.log("Found", centerpoints.length, " changesets in total")

        const perBbox = GeoOperations.spreadIntoBboxes(centerpoints, options.zoomlevel)

        for (const [tileNumber, features] of perBbox) {
            const [z, x, y] = Tiles.tile_from_index(tileNumber)
            const path = `${targetDir}/tile_${z}_${x}_${y}.geojson`
            features.forEach((f) => {
                delete f.bbox
            })
            writeFileSync(
                path,
                JSON.stringify(
                    {
                        type: "FeatureCollection",
                        features: features,
                    },
                    null,
                    "  "
                )
            )

            ScriptUtils.erasableLog("Written ", path, "which has ", features.length, "features")
        }
    }
}

new GenerateSeries().run()
