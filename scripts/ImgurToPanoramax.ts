import Script from "./Script"
import { Overpass } from "../src/Logic/Osm/Overpass"
import { RegexTag } from "../src/Logic/Tags/RegexTag"
import Constants from "../src/Models/Constants"
import { BBox } from "../src/Logic/BBox"
import { existsSync, readFileSync, writeFileSync } from "fs"
import PanoramaxImageProvider, { PanoramaxUploader } from "../src/Logic/ImageProviders/Panoramax"
import { Feature } from "geojson"
import { LicenseInfo } from "../src/Logic/ImageProviders/LicenseInfo"
import { GeoOperations } from "../src/Logic/GeoOperations"
import { Tag } from "../src/Logic/Tags/Tag"
import { Utils } from "../src/Utils"
import ChangeTagAction from "../src/Logic/Osm/Actions/ChangeTagAction"
import { And } from "../src/Logic/Tags/And"
import { Changes } from "../src/Logic/Osm/Changes"
import { ChangeDescription } from "../src/Logic/Osm/Actions/ChangeDescription"
import OsmObjectDownloader from "../src/Logic/Osm/OsmObjectDownloader"
import { OsmObject } from "../src/Logic/Osm/OsmObject"
import { File } from "buffer"
import { open } from "node:fs/promises"
import { UploadableTag } from "../src/Logic/Tags/TagTypes"
import { Imgur } from "../src/Logic/ImageProviders/Imgur"
import { Or } from "../src/Logic/Tags/Or"
import ScriptUtils from "./ScriptUtils"
import { ImmutableStore } from "../src/Logic/UIEventSource"

export class ImgurToPanoramax extends Script {
    private readonly panoramax = new PanoramaxUploader(
        Constants.panoramax.url,
        Constants.panoramax.token
    )
    private licenseChecker = new PanoramaxImageProvider()

    private readonly alreadyUploaded: Record<string, string> = this.readAlreadyUploaded()
    private readonly alreadyUploadedInv: Record<string, string> = Utils.transposeMapSimple(
        this.alreadyUploaded
    )
    private _imageDirectory: string
    private _licenseDirectory: string

    private readonly sequenceIds = {
        test: "7f34cf53-27ff-46c9-ac22-78511fa8457a",
        cc0: "e9bcb8c0-8ade-4ac9-bc9f-cfa464221fd6", // "1de6f4a1-73ac-4c75-ab7f-2a2aabddf50a", // "f0d6f78a-ff95-4db1-8494-6eb44a17bb37",
        ccby: "288a8052-b475-422c-811a-4f6f1a00015e",
        ccbysa: "f3d02893-b4c1-4cd6-8b27-e27ab57eb59a",
    } as const

    constructor() {
        super(
            "Queries OSM for 'imgur'-images, uploads them to Panoramax and creates a changeset to update OSM"
        )
    }

    private async getRawInfo(imgurUrl): Promise<{ description?: string; datetime: number }> {
        const fallbackpath =
            this._licenseDirectory + "/raw/" + imgurUrl.replaceAll(/[^a-zA-Z0-9]/g, "_") + ".json"
        if (existsSync(fallbackpath)) {
            console.log("Loaded raw info from fallback path")
            return JSON.parse(readFileSync(fallbackpath, "utf8"))["data"]
        }
        // No local data available; lets ask imgur themselves
        return new Promise((resolve) => {
            Imgur.singleton.DownloadAttribution({ url: imgurUrl }, (raw) => {
                console.log("Writing fallback to", fallbackpath, "(via raw)")
                writeFileSync(fallbackpath, JSON.stringify(raw), "utf8")
                resolve(raw["data"])
            })
        })
    }

    private async getLicenseFor(imgurUrl: string): Promise<LicenseInfo> {
        const imageName = imgurUrl.split("/").at(-1)
        const licensePath: string = this._licenseDirectory + "/" + imageName
        if (existsSync(licensePath)) {
            const rawText = readFileSync(licensePath, "utf8")
            if (rawText?.toLowerCase() === "cc0" || rawText?.toLowerCase().startsWith("cc0")) {
                return { licenseShortName: "CC0", artist: "Unknown" }
            }
            try {
                const licenseText: LicenseInfo = JSON.parse(rawText)
                if (licenseText.licenseShortName) {
                    return licenseText
                }
                console.log("<<< No valid license found in text", rawText)
                return undefined
            } catch (e) {
                console.error(
                    "Could not read ",
                    rawText.slice(0, 20),
                    "as json for image",
                    imgurUrl,
                    "from",
                    licensePath
                )
            }
        }

        // We didn't find the expected license in the expected location; search for the fallback (raw) license
        const fallbackpath =
            this._licenseDirectory + "/raw/" + imgurUrl.replaceAll(/[^a-zA-Z0-9]/g, "_") + ".json"
        if (existsSync(fallbackpath)) {
            const fallbackRaw: string = JSON.parse(readFileSync(fallbackpath, "utf8"))["data"]
                ?.description
            if (
                fallbackRaw?.toLowerCase()?.startsWith("cc0") ||
                fallbackRaw?.toLowerCase()?.indexOf("#cc0") >= 0
            ) {
                return { licenseShortName: "CC0", artist: "Unknown" }
            }
            const license = Imgur.parseLicense(fallbackRaw)
            if (license) {
                return license
            }
            console.log(
                "No (fallback) license found for (but file exists), not uploading",
                imgurUrl,
                fallbackRaw
            )
            return undefined
        }

        // No local data available; lets ask imgur themselves
        const attr = await Imgur.singleton.DownloadAttribution({ url: imgurUrl }, (raw) => {
            console.log("Writing fallback to", fallbackpath)
            writeFileSync(fallbackpath, JSON.stringify(raw), "utf8")
        })
        console.log("Got license via API:", attr?.licenseShortName)
        await ScriptUtils.sleep(500)
        if (attr?.licenseShortName) {
            return attr
        }
        return undefined
    }

    async uploadImage(key: string, feat: Feature): Promise<UploadableTag | undefined> {
        const v = feat.properties[key]
        if (!v) {
            return undefined
        }
        const isPng = v.endsWith(".png")

        const imageHash = v.split("/").at(-1).split(".").at(0)
        {
            const panohash = this.alreadyUploaded[imageHash]
            if (panohash) {
                console.log("Already uploaded", panohash)
                return new And([
                    new Tag(key.replace("image", "panoramax"), panohash),
                    new Tag(key, ""),
                ])
            }
        }

        let path: string = undefined
        if (isPng) {
            path = this._imageDirectory + "/../imgur_png_images/jpg/" + imageHash + ".jpg"
        } else if (existsSync(this._imageDirectory + "/" + imageHash + ".jpg")) {
            path = this._imageDirectory + "/" + imageHash + ".jpg"
        } else if (existsSync(this._imageDirectory + "/" + imageHash + ".jpeg")) {
            path = this._imageDirectory + "/" + imageHash + ".jpeg"
        }
        if (!path) {
            return undefined
        }
        let license: LicenseInfo
        try {
            license = await this.getLicenseFor(v)
        } catch (e) {
            console.error("Could not fetch license due to", e)
            if (e === 404) {
                console.log("NOT FOUND")
                return new Tag(key, "")
            }
            throw e
        }
        if (license === undefined) {
            return undefined
        }
        const sequence = this.sequenceIds[license.licenseShortName?.toLowerCase()]
        console.log("Reading ", path)
        if (!existsSync(path)) {
            return undefined
        }
        const handle = await open(path)
        const stat = await handle.stat()

        class MyFile extends File {
            // we should set correct size
            // otherwise we will encounter UND_ERR_REQ_CONTENT_LENGTH_MISMATCH
            size = stat.size
            stream = undefined
        }

        const file = new MyFile([], path)

        file.stream = function () {
            return handle.readableWebStream()
        }

        const licenseRaw = await this.getRawInfo(v)
        const date = new Date(licenseRaw.datetime * 1000)

        console.log("Uploading", imageHash, sequence)
        const result = await this.panoramax.uploadImage(
            <any>file,
            GeoOperations.centerpointCoordinates(feat),
            license.artist,
            true,
            sequence,
            date.toISOString()
        )
        await handle.close()
        this.alreadyUploaded[imageHash] = result.value
        this.writeAlreadyUploaded()
        return new And([new Tag(key.replace("image", result.key), result.value), new Tag(key, "")])
    }

    private writeAlreadyUploaded() {
        writeFileSync("uploaded_images.json", JSON.stringify(this.alreadyUploaded))
    }

    private readAlreadyUploaded() {
        const uploaded = JSON.parse(readFileSync("uploaded_images.json", "utf8"))
        console.log("Detected ", Object.keys(uploaded).length, "previously uploaded images")
        return uploaded
    }

    private async patchDate(panokey: string) {
        const imgurkey = this.alreadyUploadedInv[panokey]
        const license = await this.getRawInfo("https://i.imgur.com/" + imgurkey + ".jpg")
        const date = new Date(license.datetime * 1000)
        const panolicense = await this.panoramax.panoramax.search({
            ids: [panokey],
        })
        const panodata = panolicense[0]
        const collection: string = panodata.collection
        console.log({ imgurkey, date, panodata, datetime: license.datetime })
        const p = this.panoramax.panoramax
        const url = p.host + "/collections/" + collection + "/items/" + panokey
        const result = await p.fetch(url, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                ts: date.getTime(),
            }),
        })
        console.log(
            "Patched date of ",
            p.createViewLink({
                imageId: panokey,
            }),
            url,
            "result is",
            result.status,
            await result.text()
        )
    }

    async main(args: string[]): Promise<void> {
        this._imageDirectory = args[0] ?? "/home/pietervdvn/data/imgur-image-backup"
        this._licenseDirectory = args[1] ?? "/home/pietervdvn/git/MapComplete-data/ImageLicenseInfo"

        //  await this.panoramax.panoramax.createCollection("CC0 - part 2")
        //  return
        /*  for (const panohash in this.alreadyUploadedInv) {
            await this.patchDate(panohash)
            break
        }*/

        const bounds = new BBox([
            [-180, -90],
            [180, 90],
        ])
        const maxcount = 10000
        const overpassfilters: RegexTag[] = []
        const r = /^https:\/\/i.imgur.com\/.*/
        for (const k of ["image", "image:menu", "image:streetsign"]) {
            overpassfilters.push(new RegexTag(k, r))
            for (let i = 0; i < 20; i++) {
                overpassfilters.push(new RegexTag(k + ":" + i, r))
            }
        }
        const overpass = new Overpass(
            new Or(overpassfilters),
            [],
            Constants.defaultOverpassUrls[0],
            new ImmutableStore(500)
        )
        const features = (await overpass.queryGeoJson(bounds))[0].features
        const featuresCopy = [...features]
        let converted = 0

        const total = features.length
        const changes: ChangeDescription[] = []

        do {
            const f = features.shift()
            if (!f) {
                break
            }
            if (converted % 100 === 0) {
                console.log(
                    "Converted:",
                    converted,
                    "total:",
                    total,
                    "progress:",
                    Math.round((converted * 100) / total) + "%"
                )
            }

            let changedTags: (UploadableTag | undefined)[] = []
            console.log(converted + "/" + total, " handling " + f.properties.id)
            for (const k of ["image", "image:menu", "image:streetsign"]) {
                changedTags.push(await this.uploadImage(k, f))
                for (let i = 0; i < 20; i++) {
                    changedTags.push(await this.uploadImage(k + ":" + i, f))
                }
            }
            changedTags = Utils.NoNull(changedTags)
            if (changedTags.length > 0) {
                const action = new ChangeTagAction(
                    f.properties.id,
                    new And(changedTags),
                    f.properties,
                    {
                        theme: "image-mover",
                        changeType: "link-image",
                    }
                )
                changes.push(...(await action.CreateChangeDescriptions()))
            }
            converted++
        } while (converted < maxcount)

        console.log("Uploaded images for", converted, "items; now creating the changeset")

        const modif: string[] = Utils.Dedup(changes.map((ch) => ch.type + "/" + ch.id))
        const modifiedObjectsFresh: OsmObject[] = []
        const dloader = new OsmObjectDownloader()
        for (let i = 0; i < modif.length; i++) {
            if (i % 100 === 0) {
                console.log(
                    "Downloaded osm object",
                    i,
                    "/",
                    modif.length,
                    "(" + Math.round((i * 100) / modif.length) + "%)"
                )
            }
            const id = modif[i]
            const obj = await dloader.DownloadObjectAsync(id)
            if (obj === "deleted") {
                continue
            }
            modifiedObjectsFresh.push(obj)
        }
        const modifiedObjects = Changes.createChangesetObjectsStatic(
            changes,
            modifiedObjectsFresh,
            false,
            []
        )
        const cs = Changes.buildChangesetXML("0", modifiedObjects)
        writeFileSync("imgur_to_panoramax.osc", cs, "utf8")

        const usernames = featuresCopy.map((f) => f.properties.user)
        const hist: Record<string, number> = {}
        for (const username of usernames) {
            hist[username] = (hist[username] ?? 0) + 1
        }
        console.log(hist)
    }
}

new ImgurToPanoramax().run()
