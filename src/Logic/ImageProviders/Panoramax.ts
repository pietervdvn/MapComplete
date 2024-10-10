import { ImageUploader } from "./ImageUploader"
import { AuthorizedPanoramax, ImageData, Panoramax, PanoramaxXYZ } from "panoramax-js/dist"
import ExifReader from "exifreader"
import ImageProvider, { ProvidedImage } from "./ImageProvider"
import BaseUIElement from "../../UI/BaseUIElement"
import { LicenseInfo } from "./LicenseInfo"
import { GeoOperations } from "../GeoOperations"
import Constants from "../../Models/Constants"
import { Store, Stores, UIEventSource } from "../UIEventSource"
import SvelteUIElement from "../../UI/Base/SvelteUIElement"
import Panoramax_bw from "../../assets/svg/Panoramax_bw.svelte"
import Link from "../../UI/Base/Link"


export default class PanoramaxImageProvider extends ImageProvider {

    public static readonly singleton = new PanoramaxImageProvider()
    private static readonly xyz = new PanoramaxXYZ()
    private static defaultPanoramax = new AuthorizedPanoramax(Constants.panoramax.url, Constants.panoramax.token)

    public defaultKeyPrefixes: string[] = ["panoramax"]
    public readonly name: string = "panoramax"

    private static knownMeta: Record<string, { data: ImageData, time: Date }> = {}

    public SourceIcon(img?: { id: string, url: string, host?: string }, location?: {
        lon: number;
        lat: number;
    }): BaseUIElement {
        const p = new Panoramax(img.host)
        return new Link(new SvelteUIElement(Panoramax_bw), p.createViewLink({
            imageId: img?.id,
            location,
        }), true)
    }

    public addKnownMeta(meta: ImageData) {
        PanoramaxImageProvider.knownMeta[meta.id] = { data: meta, time: new Date() }
    }

    /**
     * Tries to get the entry from the mapcomplete-panoramax instance. Might return undefined
     * @param id
     * @private
     */
    private async getInfoFromMapComplete(id: string): Promise<{ data: ImageData, url: string }> {
        const sequence = "6e702976-580b-419c-8fb3-cf7bd364e6f8" // We always reuse this sequence
        const url = `https://panoramax.mapcomplete.org/`
        const data = await PanoramaxImageProvider.defaultPanoramax.imageInfo(id, sequence)
        return { url, data }
    }

    private async getInfoFromXYZ(imageId: string): Promise<{ data: ImageData, url: string }> {
        const data = await PanoramaxImageProvider.xyz.imageInfo(imageId)
        return { data, url: "https://api.panoramax.xyz/" }
    }


    /**
     * Reads a geovisio-somewhat-looking-like-geojson object and converts it to a provided image
     * @param meta
     * @private
     */
    private featureToImage(info: { data: ImageData, url: string }) {
        const meta = info?.data
        if (!meta) {
            return undefined
        }

        const url = info.url

        function makeAbsolute(s: string) {
            if (!s.startsWith("https://") && !s.startsWith("http://")) {
                const parsed = new URL(url)
                return parsed.protocol + "//" + parsed.host + s
            }
            return s
        }

        const [lon, lat] = GeoOperations.centerpointCoordinates(meta)
        return <ProvidedImage>{
            id: meta.id,
            url: makeAbsolute(meta.assets.sd.href),
            url_hd: makeAbsolute(meta.assets.hd.href),
            host: meta["links"].find(l => l.rel === "root")?.href,
            lon, lat,
            key: "panoramax",
            provider: this,
            status: meta.properties["geovisio:status"],
            rotation: Number(meta.properties["view:azimuth"]),
            date: new Date(meta.properties.datetime),
        }
    }

    private async getInfoFor(id: string): Promise<{ data: ImageData, url: string }> {
        if (!id.match(/^[a-zA-Z0-9-]+$/)) {
            return undefined
        }
        const cached = PanoramaxImageProvider.knownMeta[id]
        if (cached) {
            if (new Date().getTime() - cached.time.getTime() < 1000) {

                return { data: cached.data, url: undefined }
            }
        }
        try {
            return await this.getInfoFromMapComplete(id)
        } catch (e) {
            console.debug(e)
        }
        try {
            return await this.getInfoFromXYZ(id)
        } catch (e) {
            console.debug(e)
        }
        return undefined
    }

    public async ExtractUrls(key: string, value: string): Promise<ProvidedImage[]> {
        if (!Panoramax.isId(value)) {
            return undefined
        }
        return [await this.getInfoFor(value).then(r => this.featureToImage(<any>r))]
    }


    getRelevantUrls(tags: Record<string, string>, prefixes: string[]): Store<ProvidedImage[]> {
        const source = UIEventSource.FromPromise(super.getRelevantUrlsFor(tags, prefixes))

        function hasLoading(data: ProvidedImage[]) {
            if (data === undefined) {
                return true
            }
            return data?.some(img => img?.status !== undefined && img?.status !== "ready" && img?.status !== "broken")
        }

        Stores.Chronic(1500, () =>
            hasLoading(source.data),
        ).addCallback(_ => {
            console.log("UPdating... ")
            super.getRelevantUrlsFor(tags, prefixes).then(data => {
                console.log("New panoramax data is", data, hasLoading(data))
                source.set(data)
                return !hasLoading(data)
            })
        })

        return source
    }

    public async DownloadAttribution(providedImage: { url: string; id: string; }): Promise<LicenseInfo> {
        const meta = await this.getInfoFor(providedImage.id)

        return {
            artist: meta.data.providers.at(-1).name, // We take the last provider, as that one probably contain the username of the uploader
            date: new Date(meta.data.properties["datetime"]),
            licenseShortName: meta.data.properties["geovisio:license"],
        }
    }

    public apiUrls(): string[] {
        return ["https://panoramax.mapcomplete.org", "https://panoramax.xyz"]
    }
}

export class PanoramaxUploader implements ImageUploader {
    private readonly _panoramax: AuthorizedPanoramax
    maxFileSizeInMegabytes = 100 * 1000 * 1000 // 100MB

    constructor(url: string, token: string) {
        this._panoramax = new AuthorizedPanoramax(url, token)
    }

    async uploadImage(blob: File, currentGps: [number, number], author: string): Promise<{
        key: string;
        value: string;
        absoluteUrl: string
    }> {

        let tags: ExifReader.Tags = undefined
        let hasDate = false
        let hasGPS = false
        try {
            const tags = await ExifReader.load(blob)
            hasDate  = tags?.DateTime !== undefined
            hasGPS = tags?.GPSLatitude !== undefined && tags?.GPSLongitude !== undefined
        } catch (e) {
            console.error("Could not read EXIF-tags")
        }

        let [lon, lat] = currentGps

        const p = this._panoramax
        const defaultSequence = (await p.mySequences())[0]
        const img = <ImageData>await p.addImage(blob, defaultSequence, {
            // It might seem odd that we set 'undefined' here - keep in mind that, by default, panoramax will use the EXIF-data
            // We only pass variables as fallback!
            lat: !hasGPS ? lat : undefined,
            lon: !hasGPS ? lon : undefined,
            datetime: !hasDate ? new Date().toISOString() : undefined,
            exifOverride: {
                Artist: author,
            },

        })
        PanoramaxImageProvider.singleton.addKnownMeta(img)
        return {
            key: "panoramax",
            value: img.id,
            absoluteUrl: img.assets.hd.href,
        }
    }

}
