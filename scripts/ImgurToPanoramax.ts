import Script from "./Script"
import { Overpass } from "../src/Logic/Osm/Overpass"
import { RegexTag } from "../src/Logic/Tags/RegexTag"
import Constants from "../src/Models/Constants"
import { BBox } from "../src/Logic/BBox"
import { existsSync, readFileSync, writeFileSync } from "fs"
import { PanoramaxUploader } from "../src/Logic/ImageProviders/Panoramax"
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
import { createReadStream } from "node:fs"
import { File } from 'buffer';
import { open } from 'node:fs/promises';
import { UploadableTag } from "../src/Logic/Tags/TagTypes"


export class ImgurToPanoramax extends Script {

    private readonly panoramax = new PanoramaxUploader(Constants.panoramax.url, Constants.panoramax.token)

    private _imageDirectory: string
    private _licenseDirectory: string

    private readonly sequenceIds = {
        test: "7f34cf53-27ff-46c9-ac22-78511fa8457a",
        cc0: "f0d6f78a-ff95-4db1-8494-6eb44a17bb37",
        ccby: "288a8052-b475-422c-811a-4f6f1a00015e",
        ccbysa: "f3d02893-b4c1-4cd6-8b27-e27ab57eb59a",
    } as const


    constructor() {
        super(
            "Queries OSM for 'imgur'-images, uploads them to Panoramax and creates a changeset to update OSM",
        )
    }

    async uploadImage(key: string, feat: Feature, sequences: ({
        id: string;
        "stats:items": { count: number }
    })[]): Promise<UploadableTag | undefined> {
        const v = feat.properties[key]
        if (!v) {
            return undefined
        }
        const imageHash = v.split("/").at(-1).split(".").at(0)
        let path: string = undefined
        if (existsSync(this._imageDirectory + "/" + imageHash + ".jpg")) {
            path = this._imageDirectory + "/" + imageHash + ".jpg"
        } else if (existsSync(this._imageDirectory + "/" + imageHash + ".jpeg")) {
            path = this._imageDirectory + "/" + imageHash + ".jpeg"
        }
        if (!path) {
            return undefined
        }
        const licensePath = this._licenseDirectory + "/" + v.replaceAll(/[^a-zA-Z0-9]/g, "_") + ".json"
        if (!existsSync(licensePath)) {
            return undefined
        }
        const licenseText: LicenseInfo = JSON.parse(readFileSync(licensePath, "utf8"))
        if (!licenseText.licenseShortName) {
            console.log("No license found for", path, licenseText)
            return undefined
        }
        const license = licenseText.licenseShortName.toLowerCase().split(" ")[0].replace(/-/g, "")
        const sequence = this.sequenceIds[license]
        const author = licenseText.artist


        const handle = await open(path);

        const stat = await handle.stat();

        class MyFile extends File {
            // we should set correct size
            // otherwise we will encounter UND_ERR_REQ_CONTENT_LENGTH_MISMATCH
            size = stat.size;
            stream = undefined
        }

        const file = new MyFile([], path)

        file.stream = function() {
            return handle.readableWebStream();
        };

        console.log("Uploading", imageHash, sequence)
        const result = await this.panoramax.uploadImage(<any> file, GeoOperations.centerpointCoordinates(feat), author, true, sequence)
        await handle.close()
        return new And([new Tag(key.replace("image", result.key), result.value),
            new Tag(key,"")])
    }

    async main(args: string[]): Promise<void> {
        this._imageDirectory = args[0] ?? "/home/pietervdvn/data/imgur-image-backup"
        this._licenseDirectory = args[1] ?? "/home/pietervdvn/git/MapComplete-data/ImageLicenseInfo"

        const bounds = new BBox([[3.6984301050112833, 51.06715570450848], [3.7434328399847914, 51.039379568816145]])
        const maxcount = 100
        const filter = new RegexTag("image", /^https:\/\/i.imgur.com\/.*/)
        const overpass = new Overpass(filter, [], Constants.defaultOverpassUrls[0])
        const features = (await overpass.queryGeoJson(bounds))[0].features

        let converted = 0

        const pano = this.panoramax.panoramax
        const sequences = await pano.mySequences()
        const changes: ChangeDescription[] = []
        do {
            const f = features.shift()
            if (!f) {
                break
            }

            const changedTags: (UploadableTag | undefined)[] = []
            for (const k of ["image", "image:menu", "image:streetsign"]) {
                changedTags.push(await this.uploadImage(k, f, sequences))
                for (let i = 0; i < 20; i++) {
                    changedTags.push(
                        await this.uploadImage(k + ":" + i, f, sequences),
                    )
                }
            }
            const action = new ChangeTagAction(f.properties.id, new And(Utils.NoNull(changedTags)),
                f.properties, {
                    theme: "image-mover",
                    changeType: "link-image",
                },
            )
            changes.push(...await action.CreateChangeDescriptions())
            converted++
        } while (converted < maxcount)

        const modif: string[] = Utils.Dedup(changes.map(ch => ch.type + "/" + ch.id))
        const modifiedObjectsFresh =
          <OsmObject[]>  (await Promise.all(modif.map(id => new OsmObjectDownloader().DownloadObjectAsync(id))))
                .filter(m => m !== "deleted")
        const modifiedObjects = Changes.createChangesetObjectsStatic(
            changes,
            modifiedObjectsFresh,false, [])
        const cs = Changes.buildChangesetXML("0", modifiedObjects)
        writeFileSync("imgur_to_panoramax.osc", cs, "utf8")

    }

}

new ImgurToPanoramax().run()
