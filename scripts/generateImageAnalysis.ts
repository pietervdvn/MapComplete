import Script from "./Script"
import { Overpass } from "../Logic/Osm/Overpass"
import { RegexTag } from "../Logic/Tags/RegexTag"
import { ImmutableStore } from "../Logic/UIEventSource"
import { BBox } from "../Logic/BBox"
import * as fs from "fs"
import { Feature } from "geojson"
import ScriptUtils from "./ScriptUtils"
import { Imgur } from "../Logic/ImageProviders/Imgur"
import { LicenseInfo } from "../Logic/ImageProviders/LicenseInfo"
import { Utils } from "../Utils"

export default class GenerateImageAnalysis extends Script {
    constructor() {
        super(
            "Downloads (from overpass) all tags which have an imgur-image; then analyses the licenses"
        )
    }

    async fetchImages(key: string, datapath: string): Promise<void> {
        const targetPath = `${datapath}/features_with_${key.replace(/[:\/]/, "_")}.geojson`
        if (fs.existsSync(targetPath)) {
            console.log("Skipping", key)
            return
        }
        const tag = new RegexTag(key, /^https:\/\/i.imgur.com\/.*$/i)
        const overpass = new Overpass(
            tag,
            [],
            "https://overpass.kumi.systems/api/interpreter",
            new ImmutableStore(500),
            undefined,
            false
        )
        console.log("Starting query...")
        const data = await overpass.queryGeoJson(BBox.global)
        console.log("Got data: ", data[0].features.length)
        fs.writeFileSync(targetPath, JSON.stringify(data[0]), "utf8")
        console.log("Written", targetPath)
    }

    async downloadData(datapath: string): Promise<void> {
        if (!fs.existsSync(datapath)) {
            fs.mkdirSync(datapath)
        }

        await this.fetchImages("image", datapath)
        await this.fetchImages("image:streetsign", datapath)
        for (let i = 0; i < 5; i++) {
            await this.fetchImages("image:" + i, datapath)
        }
    }

    loadData(datapath: string): Feature[] {
        const allFeatures: Feature[] = []

        const files = ScriptUtils.readDirRecSync(datapath)
        for (const file of files) {
            if (!file.endsWith(".geojson")) {
                continue
            }
            const contents = JSON.parse(fs.readFileSync(file, "utf8"))
            allFeatures.push(...contents.features)
        }

        return allFeatures
    }

    async fetchImageMetadata(datapath: string, image: string): Promise<boolean> {
        if (image === undefined) {
            return false
        }
        if (!image.match(/https:\/\/i\.imgur\.com\/[a-zA-Z0-9]+\.jpg/)) {
            return false
        }
        const targetPath = datapath + "/" + image.replace(/[\/:.\-%]/g, "_") + ".json"
        if (fs.existsSync(targetPath)) {
            return false
        }
        const attribution = await Imgur.singleton.DownloadAttribution(image)
        await fs.writeFileSync(targetPath, JSON.stringify(attribution, null, "    "))
        return true
    }

    async downloadMetadata(datapath: string): Promise<void> {
        const features = this.loadData(datapath)
        let allImages = new Set<string>()

        for (const feature of features) {
            allImages.add(feature.properties["image"])
            for (let i = 0; i < 10; i++) {
                allImages.add(feature.properties["image:" + i])
            }
        }
        console.log("Detected", allImages.size, "images")
        let i = 0
        let d = 0
        let s = 0
        let f = 0
        let start = Date.now()
        for (const image of Array.from(allImages)) {
            i++
            try {
                const downloaded = await this.fetchImageMetadata(datapath, image)
                const runningSecs = (Date.now() - start) / 1000
                const left = allImages.size - i

                const estimatedActualSeconds = Math.floor((left * runningSecs) / (f + d))
                const estimatedActualMinutes = Math.floor(estimatedActualSeconds / 60)

                const msg = `${i}/${
                    allImages.size
                } downloaded: ${d},skipped: ${s}, failed: ${f}, running: ${Math.floor(runningSecs)}sec, ETA: ${estimatedActualMinutes}:${
                    estimatedActualSeconds % 60
                }`
                ScriptUtils.erasableLog( "                                                                                                              ",  msg)
                if (downloaded) {
                    d++
                } else {
                    s++
                }
                if (d + f == 75000) {
                    console.log("Used 75000 API calls, leaving 5000 for the rest of the day...")
                }
            } catch (e) {
                console.log(e)
                f++
            }
        }
    }

    analyze(datapath: string) {
        const files = ScriptUtils.readDirRecSync(datapath)
        const byAuthor = new Map<string, string[]>()
        const byLicense = new Map<string, string[]>()
        const licenseByAuthor = new Map<string, Set<string>>()
        for (const file of files) {
            if (!file.endsWith(".json")) {
                continue
            }
            const attr = <LicenseInfo>JSON.parse(fs.readFileSync(file, { encoding: "utf8" }))
            const license = attr.licenseShortName

            if (license === undefined || attr.artist === undefined) {
                continue
            }
            if (byAuthor.get(attr.artist) === undefined) {
                byAuthor.set(attr.artist, [])
            }
            byAuthor.get(attr.artist).push(file)

            if (byLicense.get(license) === undefined) {
                byLicense.set(license, [])
            }
            byLicense.get(license).push(file)

            if (licenseByAuthor.get(license) === undefined) {
                licenseByAuthor.set(license, new Set<string>())
            }
            licenseByAuthor.get(license).add(attr.artist)
        }
        byAuthor.delete(undefined)
        byLicense.delete(undefined)
        licenseByAuthor.delete(undefined)

        const byLicenseCount = Utils.MapToObj(byLicense, (a) => a.length)
        const byAuthorCount = Utils.MapToObj(byAuthor, (a) => a.length)
        const licenseByAuthorCount = Utils.MapToObj(licenseByAuthor, (a) => a.size)

        const countsPerAuthor: number[] = Array.from(Object.keys(byAuthorCount)).map(
            (k) => byAuthorCount[k]
        )
        console.log(countsPerAuthor)
        countsPerAuthor.sort()
        const median = countsPerAuthor[Math.floor(countsPerAuthor.length / 2)]
        for (let i = 0; i < 100; i++) {
            let maxAuthor: string = undefined
            let maxCount = 0
            for (const author in byAuthorCount) {
                const count = byAuthorCount[author]
                if (maxAuthor === undefined || count > maxCount) {
                    maxAuthor = author
                    maxCount = count
                }
            }
            console.log(
                "|",
                i + 1,
                "|",
                `[${maxAuthor}](https://openstreetmap.org/user/${maxAuthor.replace(/ /g, "%20")})`,
                "|",
                maxCount,
                "|"
            )
            delete byAuthorCount[maxAuthor]
        }

        const totalAuthors = byAuthor.size
        let totalLicensedImages = 0
        for (const license in byLicenseCount) {
            totalLicensedImages += byLicenseCount[license]
        }
        for (const license in byLicenseCount) {
            const total = byLicenseCount[license]
            const authors = licenseByAuthorCount[license]
            console.log(
                `License ${license}: ${total} total pictures (${
                    Math.floor((1000 * total) / totalLicensedImages) / 10
                }%), ${authors} authors (${
                    Math.floor((1000 * authors) / totalAuthors) / 10
                }%), ${Math.floor(total / authors)} images/author`
            )
        }

        const nonDefaultAuthors = [
            ...Array.from(licenseByAuthor.get("CC-BY 4.0").values()),
            ...Array.from(licenseByAuthor.get("CC-BY-SA 4.0").values()),
        ]

        console.log("Total number of correctly licenses pictures: ", totalLicensedImages)
        console.log("Total number of authors:", byAuthor.size)
        console.log(
            "Total number of authors which used a valid, non CC0 license at one point in time",
            nonDefaultAuthors.length
        )
        console.log("Median contributions per author:", median)
    }

    async main(args: string[]): Promise<void> {
        const datapath = args[0] ?? "../../git/MapComplete-data/ImageLicenseInfo"
        await this.downloadData(datapath)

        await this.downloadMetadata(datapath)
        this.analyze(datapath)
    }
}

new GenerateImageAnalysis().run()
