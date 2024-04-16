import Script from "./Script"
import { Overpass } from "../src/Logic/Osm/Overpass"
import { RegexTag } from "../src/Logic/Tags/RegexTag"
import { ImmutableStore } from "../src/Logic/UIEventSource"
import { BBox } from "../src/Logic/BBox"
import * as fs from "fs"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { Feature } from "geojson"
import ScriptUtils from "./ScriptUtils"
import { Imgur } from "../src/Logic/ImageProviders/Imgur"
import { LicenseInfo } from "../src/Logic/ImageProviders/LicenseInfo"
import { Utils } from "../src/Utils"
import Constants from "../src/Models/Constants"

export default class GenerateImageAnalysis extends Script {
    /**
     * Max N in `image:N`-keys and `imageN` keys
     * @private
     */
    private static readonly maxImageIndex = 31
    constructor() {
        super(
            [
                "Downloads (from overpass) all tags which have an imgur-image; then analyses the licenses and downloads all the images",
                "",
                "Arguments:",
                "Path to download the images to",
                "Path to save the overview to",
            ].join("\n")
        )
    }

    async fetchImages(key: string, datapath: string, refresh: boolean): Promise<void> {
        const targetPath = `${datapath}/features_with_${key.replace(/[:\/]/, "_")}.geojson`
        if (fs.existsSync(targetPath) && !refresh) {
            console.log("Skipping", key)
            return
        }
        const tag = new RegexTag(key, /^https:\/\/i.imgur.com\/.*$/i)
        const overpass = new Overpass(
            tag,
            [],
            Constants.defaultOverpassUrls[0], //"https://overpass.kumi.systems/api/interpreter",
            new ImmutableStore(500),
            false
        )
        console.log("Starting query...")
        const data = await overpass.queryGeoJson(BBox.global)
        console.log(
            "Got data:",
            data[0].features.length,
            "items; timestamp:",
            data[1].toISOString()
        )
        fs.writeFileSync(targetPath, JSON.stringify(data[0]), "utf8")
        console.log("Written", targetPath)
    }

    async downloadData(datapath: string, refresh: boolean): Promise<void> {
        if (!fs.existsSync(datapath)) {
            fs.mkdirSync(datapath)
        }
        await this.fetchImages("image", datapath, refresh)
        await this.fetchImages("image:streetsign", datapath, refresh)
        for (let i = 0; i < GenerateImageAnalysis.maxImageIndex; i++) {
            await this.fetchImages("image:" + i, datapath, refresh)
            await this.fetchImages("image" + i, datapath, refresh)
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
        const filename = image.replace(/[\/:.\-%]/g, "_") + ".json"
        const targetPath = datapath + "/" + filename
        if (fs.existsSync(targetPath)) {
            return false
        }
        const attribution = await Imgur.singleton.DownloadAttribution({ url: image })

        if ((attribution.artist ?? "") === "") {
            // This is an invalid attribution. We save the raw response as well
            const hash = image.substr("https://i.imgur.com/".length).split(".jpg")[0]

            const apiUrl = "https://api.imgur.com/3/image/" + hash
            const response = await Utils.downloadJsonCached(apiUrl, 365 * 24 * 60 * 60, {
                Authorization: "Client-ID " + Constants.ImgurApiKey,
            })
            const rawTarget = datapath + "/raw/" + filename
            console.log("Also storing the raw response to", rawTarget)
            await fs.writeFileSync(rawTarget, JSON.stringify(response, null, "    "))
        }

        await fs.writeFileSync(targetPath, JSON.stringify(attribution, null, "    "))
        return true
    }

    loadImageUrls(datapath: string): { allImages: Set<string>; imageSource: Map<string, string> } {
        let allImages = new Set<string>()
        const features = this.loadData(datapath)
        let imageSource: Map<string, string> = new Map<string, string>()

        for (const feature of features) {
            allImages.add(feature.properties["image"])
            imageSource[feature.properties["image"]] = feature.properties.id
            allImages.add(feature.properties["image:streetsign"])
            imageSource[feature.properties["image:streetsign"]] =
                feature.properties.id + " (streetsign)"

            for (let i = 0; i < GenerateImageAnalysis.maxImageIndex; i++) {
                allImages.add(feature.properties["image:" + i])
                imageSource[
                    feature.properties["image:" + i]
                ] = `${feature.properties.id} (image:${i})`

                allImages.add(feature.properties["image" + i])
                imageSource[
                    feature.properties["image" + i]
                ] = `${feature.properties.id} (image${i})`
            }
        }
        allImages.delete(undefined)
        allImages.delete(null)
        imageSource.delete(undefined)
        imageSource.delete(null)
        return { allImages, imageSource }
    }

    async downloadMetadata(datapath: string): Promise<void> {
        const { allImages, imageSource } = this.loadImageUrls(datapath)
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
                } downloaded: ${d},skipped: ${s}, failed: ${f}, running: ${Math.floor(
                    runningSecs
                )}sec, ETA: ${estimatedActualMinutes}:${estimatedActualSeconds % 60}`
                if (d + (f % 1000) === 1 || downloaded) {
                    ScriptUtils.erasableLog(msg)
                }
                if (downloaded) {
                    d++
                } else {
                    s++
                }
                if (d + f == 75000) {
                    console.log("Used 75000 API calls, leaving 5000 for the rest of the day...")
                    break
                }
            } catch (e) {
                // console.log(e)
                console.log(
                    "Offending image hash is",
                    image,
                    "from https://openstreetmap.org/" + imageSource[image]
                )
                f++
            }
        }
    }

    async downloadViews(datapath: string): Promise<void> {
        const { allImages, imageSource } = this.loadImageUrls(datapath)
        console.log("Detected", allImages.size, "images")
        const results: [string, number][] = []
        const today = new Date().toISOString().substring(0, "YYYY-MM-DD".length)
        const viewDir = datapath + "/views_" + today
        if (!existsSync(viewDir)) {
            mkdirSync(viewDir)
        }
        const targetpath = datapath + "/views.csv"

        const total = allImages.size
        let dloaded = 0
        let skipped = 0
        let err = 0
        for (const image of Array.from(allImages)) {
            const cachedView = viewDir + "/" + image.replace(/\//g, "_")
            let attribution: LicenseInfo
            if (existsSync(cachedView)) {
                attribution = JSON.parse(readFileSync(cachedView, "utf8"))
                skipped++
            } else {
                try {
                    attribution = await Imgur.singleton.DownloadAttribution({ url: image })
                    await ScriptUtils.sleep(500)
                    writeFileSync(cachedView, JSON.stringify(attribution))
                    dloaded++
                } catch (e) {
                    err++
                    continue
                }
            }
            results.push([image, attribution.views])
            if (dloaded % 50 === 0) {
                console.log({
                    dloaded,
                    skipped,
                    total,
                    err,
                    progress: Math.round(dloaded + skipped + err),
                })
            }

            if ((dloaded + skipped + err) % 100 === 0) {
                console.log("Writing views to", targetpath)
                fs.writeFileSync(targetpath, results.map((r) => r.join(",")).join("\n"))
            }
        }
        console.log("Writing views to", targetpath)
        fs.writeFileSync(targetpath, results.map((r) => r.join(",")).join("\n"))
    }

    async downloadImage(url: string, imagePath: string): Promise<boolean> {
        const filenameLong = url.replace(/[\/:.\-%]/g, "_") + ".jpg"
        const targetPathLong = imagePath + "/" + filenameLong

        const filename = url.substring("https://i.imgur.com/".length)
        const targetPath = imagePath + "/" + filename
        if (fs.existsSync(targetPathLong)) {
            if (fs.existsSync(targetPath)) {
                fs.unlinkSync(targetPathLong)
                console.log("Unlinking duplicate")
                return false
            }
            console.log("Renaming...")
            fs.renameSync(targetPathLong, targetPath)
            return false
        }
        if (fs.existsSync(targetPath)) {
            return false
        }
        await ScriptUtils.DownloadFileTo(url, targetPath)
        return true
    }

    async downloadAllImages(datapath: string, imagePath: string): Promise<void> {
        const { allImages } = this.loadImageUrls(datapath)
        let skipped = 0
        let failed = 0
        let downloaded = 0
        let invalid = 0
        const startTime = Date.now()
        const urls = Array.from(allImages).filter((url) => url.startsWith("https://i.imgur.com"))
        for (const url of urls) {
            const runningTime = (Date.now() - startTime) / 1000
            const handled = skipped + downloaded + failed
            const itemsLeft = allImages.size - handled
            const speed = handled / runningTime
            const timeLeft = Math.round(itemsLeft * speed)
            try {
                const urls = url.split(/[;,]/)
                const downloadedStatus = await Promise.all(
                    urls.map((url) => this.downloadImage(url.trim(), imagePath))
                )

                for (const b of downloadedStatus) {
                    if (b) {
                        downloaded += 1
                    } else {
                        skipped += 1
                    }
                }

                if (downloadedStatus.some((i) => i) || skipped % 10000 === 0) {
                    console.log(
                        "Handled",
                        url,
                        JSON.stringify({
                            skipped,
                            failed,
                            downloaded,
                            invalid,
                            total: allImages.size,
                            eta: timeLeft + "s",
                        })
                    )
                }
            } catch (e) {
                console.log(e)
                failed++
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
        const json: {
            leaderboard: { rank: number; account: string; name: string; nrOfImages: number }[]
        } = {
            leaderboard: [],
        }
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
            json.leaderboard.push({
                rank: i + 1,
                name: maxAuthor,
                account: "https://openstreetmap.org/user/" + maxAuthor.replace(/ /g, "%20"),
                nrOfImages: maxCount,
            })
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
        json["totalAuthors"] = totalAuthors
        for (const license in byLicenseCount) {
            totalLicensedImages += byLicenseCount[license]
        }
        json["byLicense"] = {}
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
            json["byLicense"] = {
                license,
                total,
                authors,
            }
        }

        const nonDefaultAuthors = [
            ...Array.from(licenseByAuthor.get("CC-BY 4.0").values()),
            ...Array.from(licenseByAuthor.get("CC-BY-SA 4.0").values()),
        ]

        console.log(
            "Total number of correctly licenses pictures: ",
            totalLicensedImages,
            "(out of ",
            files.length,
            " images)"
        )
        console.log("Total number of authors:", byAuthor.size)
        console.log(
            "Total number of authors which used a valid, non CC0 license at one point in time",
            nonDefaultAuthors.length
        )
        console.log("Median contributions per author:", median)
        json["median"] = median
        json["date"] = new Date().toISOString()
        writeFileSync(
            "../../git/MapComplete-data/picture-leaderboard.json",
            JSON.stringify(json),
            "utf8"
        )
    }

    async main(args: string[]): Promise<void> {
        console.log("Usage: [--cached] to use the cached osm data")
        console.log("Args are", args)
        const cached = args.indexOf("--cached") < 0
        args = args.filter((a) => a !== "--cached")
        const datapath = args[1] ?? "../../git/MapComplete-data/ImageLicenseInfo"
        const imageBackupPath = args[0]
        if (imageBackupPath === "" || imageBackupPath === undefined) {
            throw "No imageBackup path specified"
        }
        await this.downloadData(datapath, cached)

        // await this.downloadViews(datapath)
        await this.downloadMetadata(datapath)
        await this.downloadAllImages(datapath, imageBackupPath)
        this.analyze(datapath)
    }
}

new GenerateImageAnalysis().run()
