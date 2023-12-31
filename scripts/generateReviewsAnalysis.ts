import Script from "./Script"
import * as fs from "fs"
import { Review } from "mangrove-reviews-typescript"
import { parse } from "csv-parse"
import { Feature, FeatureCollection, Point } from "geojson"

/**
 * To be run from the repository root, e.g.
 *  vite-node scripts/generateReviewsAnalysis.ts -- ~/Downloads/mangrove.reviews_1704031255.csv
 */
export default class GenerateReviewsAnalysis extends Script {
    constructor() {
        super("Analyses a CSV-file with Mangrove reviews")
    }

    async analyze(datapath: string) {
        const reviews = await this.parseCsv(datapath)

        const clientWebsites: Record<string, number> = {}
        const themeHist: Record<string, number> = {}
        const languageHist: Record<string, number> = {}

        const geojsonFeatures: Feature<Point, Record<string, string>>[] = []

        for (const review of reviews) {
            try {
                const client = new URL(review.metadata.client_id)
                clientWebsites[client.host] = 1 + (clientWebsites[client.host] ?? 0)
                if (
                    client.host.indexOf("mapcomplete") >= 0 ||
                    client.host.indexOf("pietervdvn") >= 0
                ) {
                    let theme = client.pathname.substring(client.pathname.lastIndexOf("/") + 1)
                    if (theme.endsWith(".html")) {
                        theme = theme.substring(0, theme.length - 5)
                    }
                    if (theme === "theme") {
                        // THis is a custom layout
                        theme =
                            client.searchParams.get("layout") ??
                            client.searchParams.get("userlayout")
                    }
                    theme = "https://mapcomplete.org/" + theme
                    themeHist[theme] = (themeHist[theme] ?? 0) + 1

                    const language = client.searchParams.get("language")
                    languageHist[language] = (languageHist[language] ?? 0) + 1
                }
            } catch (e) {
                console.error("Not a url:", review.metadata.client_id)
            }

            try {
                const geo = new URL(review.sub)
                if (geo.protocol !== "geo:") {
                    continue
                }
                const [lat, lon] = geo.pathname.split(",").map(Number)
                console.log(lat, lon)
                geojsonFeatures.push({
                    geometry: {
                        type: "Point",
                        coordinates: [lon, lat],
                    },
                    type: "Feature",
                    properties: {
                        name: geo.searchParams.get("q"),
                        rating: "" + review.rating,
                        opinion: review.opinion,
                        client: review.metadata.client_id,
                        nickname: review.metadata.nickname,
                        affiliated: "" + review.metadata.is_affiliated,
                    },
                })
            } catch (e) {
                console.error(e)
            }
        }
        console.log("Total number of reviews", reviews.length)
        this.print("Website", clientWebsites)
        this.print("Theme", themeHist)
        this.print("language", languageHist)
        const fc: FeatureCollection = {
            type: "FeatureCollection",
            features: geojsonFeatures,
        }

        const fcmc: FeatureCollection = {
            type: "FeatureCollection",
            features: geojsonFeatures.filter(
                (f) =>
                    f.properties.client.indexOf("mapcomplete") >= 0 ||
                    f.properties.client.indexOf("pietervdvn.github.io") >= 0
            ),
        }
        fs.writeFileSync(
            "../MapComplete-data/reviews.geojson",

            JSON.stringify(fc),
            { encoding: "utf-8" }
        )
        fs.writeFileSync(
            "../MapComplete-data/reviewsmc.geojson",

            JSON.stringify(fcmc),
            { encoding: "utf-8" }
        )
    }

    async main(args: string[]): Promise<void> {
        if (args.length === 0) {
            console.log(
                "Usage: enter file path of mangrove.reviews_timestamp.csv as first argument"
            )
        }
        const datapath = args[0] ?? "../MapComplete-data/mangrove.reviews_1674234503.csv"
        await this.analyze(datapath)
    }

    private sort(record: Record<string, number>): Record<string, number> {
        record = { ...record }
        const result: Record<string, number> = {}
        do {
            let maxKey: string = undefined
            let maxCount: number = -999

            for (const key in record) {
                const c = record[key]
                if (c > maxCount) {
                    maxCount = c
                    maxKey = key
                }
            }
            result[maxKey] = maxCount
            delete record[maxKey]
        } while (Object.keys(record).length > 0)

        return result
    }

    private print(type: string, histogram: Record<string, number>) {
        console.log(type, this.sort(histogram))
    }

    private parseCsv(datapath: string): Promise<Review[]> {
        const header: string[] = [
            "signature",
            "pem",
            "iat",
            "sub",
            "rating",
            "opinion",
            "images",
            "metadata",
        ]
        return new Promise<Review[]>((resolve) => {
            const parser = parse({ delimiter: "," }, function (err, data) {
                const asJson: Review[] = []
                for (let i = 1; i < data.length; i++) {
                    const line = data[i]
                    const entry: Review = { sub: undefined }
                    for (let c = 0; c < line.length; c++) {
                        const key: string = header[c]
                        let value = line[c]
                        if (value === "none") {
                            value = null
                        } else if (key === "images" || key === "metadata") {
                            try {
                                value = JSON.parse(value)
                            } catch (e) {
                                console.log("Could not parse", value, "\n", line)
                            }
                        }
                        entry[key] = value
                    }
                    asJson.push(entry)
                }
                resolve(asJson)
            })
            fs.createReadStream(datapath).pipe(parser)
        })
    }
}

new GenerateReviewsAnalysis().run()
