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
    public static readonly singleton: PanoramaxImageProvider = new PanoramaxImageProvider()
    private static readonly xyz = new PanoramaxXYZ()
    private static defaultPanoramax = new AuthorizedPanoramax(
        Constants.panoramax.url,
        Constants.panoramax.token,
        3000
    )

    public defaultKeyPrefixes: string[] = ["panoramax"]
    public readonly name: string = "panoramax"

    private static knownMeta: Record<string, { data: ImageData; time: Date }> = {}

    public SourceIcon(
        img?: { id: string; url: string; host?: string },
        location?: {
            lon: number
            lat: number
        }
    ): BaseUIElement {
        const p = new Panoramax(img.host)
        return new Link(
            new SvelteUIElement(Panoramax_bw),
            p.createViewLink({
                imageId: img?.id,
                location,
            }),
            true
        )
    }

    public addKnownMeta(meta: ImageData) {
        PanoramaxImageProvider.knownMeta[meta.id] = { data: meta, time: new Date() }
    }

    /**
     * Tries to get the entry from the mapcomplete-panoramax instance. Might return undefined
     * @param id
     * @private
     */
    private async getInfoFromMapComplete(id: string): Promise<{ data: ImageData; url: string }> {
        const url = `https://panoramax.mapcomplete.org/`
        const data = await PanoramaxImageProvider.defaultPanoramax.imageInfo(id)
        return { url, data }
    }

    private async getInfoFromXYZ(imageId: string): Promise<{ data: ImageData; url: string }> {
        const data = await PanoramaxImageProvider.xyz.imageInfo(imageId)
        return { data, url: "https://api.panoramax.xyz/" }
    }

    /**
     * Reads a geovisio-somewhat-looking-like-geojson object and converts it to a provided image
     * @private
     */
    private featureToImage(info: { data: ImageData; url: string }) {
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
            host: meta["links"].find((l) => l.rel === "root")?.href,
            lon,
            lat,
            key: "panoramax",
            provider: this,
            status: meta.properties["geovisio:status"],
            rotation: Number(meta.properties["view:azimuth"]),
            date: new Date(meta.properties.datetime),
        }
    }

    private async getInfoFor(id: string): Promise<{ data: ImageData; url: string }> {
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
        return [await this.getInfo(value)]
    }

    public async getInfo(hash: string): Promise<ProvidedImage> {
      return  await this.getInfoFor(hash).then((r) => this.featureToImage(<any>r))
    }

    getRelevantUrls(tags: Record<string, string>, prefixes: string[]): Store<ProvidedImage[]> {
        const source = UIEventSource.FromPromise(super.getRelevantUrlsFor(tags, prefixes))

        function hasLoading(data: ProvidedImage[]) {
            if (data === undefined) {
                return true
            }
            return data?.some(
                (img) =>
                    img?.status !== undefined &&
                    img?.status !== "ready" &&
                    img?.status !== "broken" &&
                    img?.status !== "hidden"
            )
        }

        Stores.Chronic(1500, () => hasLoading(source.data)).addCallback(() => {
            super.getRelevantUrlsFor(tags, prefixes).then((data) => {
                source.set(data)
                return !hasLoading(data)
            })
        })

        return Stores.ListStabilized(source)
    }

    public async DownloadAttribution(providedImage: {
        url: string
        id: string
    }): Promise<LicenseInfo> {
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

    public static getPanoramaxInstance(host: string) {
        host = new URL(host).host
        if (new URL(this.defaultPanoramax.host).host === host) {
            return this.defaultPanoramax
        }
        if (new URL(this.xyz.host).host === host) {
            return this.xyz
        }
        return new Panoramax(host)
    }
}

export class PanoramaxUploader implements ImageUploader {
    public readonly panoramax: AuthorizedPanoramax
    maxFileSizeInMegabytes = 100 * 1000 * 1000 // 100MB
    private readonly _targetSequence?: Store<string>

    constructor(url: string, token: string, targetSequence?: Store<string>) {
        this._targetSequence = targetSequence
        this.panoramax = new AuthorizedPanoramax(url, token)
    }

    async uploadImage(
        blob: File,
        currentGps: [number, number],
        author: string,
        noblur: boolean = false,
        sequenceId?: string,
        datetime?: string
    ): Promise<{
        key: string
        value: string
        absoluteUrl: string
    }> {
        // https://panoramax.openstreetmap.fr/api/docs/swagger#/

        let [lon, lat] = currentGps ?? [undefined, undefined]
        datetime ??= new Date().toISOString()
        try {
            const tags = await ExifReader.load(blob)
            const [[latD], [latM], [latS, latSDenom]] = <
                [[number, number], [number, number], [number, number]]
            >tags?.GPSLatitude?.value
            const [[lonD], [lonM], [lonS, lonSDenom]] = <
                [[number, number], [number, number], [number, number]]
            >tags?.GPSLongitude?.value

            const exifLat = latD + latM / 60 + latS / (3600 * latSDenom)
            const exifLon = lonD + lonM / 60 + lonS / (3600 * lonSDenom)
            if (
                typeof exifLat === "number" &&
                !isNaN(exifLat) &&
                typeof exifLon === "number" &&
                !isNaN(exifLon) &&
                !(exifLat === 0 && exifLon === 0)
            ) {
                lat = exifLat
                lon = exifLon
                if(tags?.GPSLatitudeRef?.value?.[0] === "S"){
                    lat *= -1
                }
                if(tags?.GPSLongitudeRef?.value?.[0] === "W"){
                    lon *= -1
                }
            }
            const [date, time] =( tags.DateTime.value[0] ?? tags.DateTimeOriginal.value[0] ?? tags.GPSDateStamp ?? tags["Date Created"]).split(" ")
            const exifDatetime = new Date(date.replaceAll(":", "-") + "T" + time)
            if (exifDatetime.getFullYear() === 1970) {
                // The data probably got reset to the epoch
                // we don't use the value
                console.log(
                    "Datetime from picture is probably invalid:",
                    exifDatetime,
                    "using 'now' instead"
                )
            } else {
                datetime = exifDatetime.toISOString()
            }
            console.log("Tags are", tags)
        } catch (e) {
            console.error("Could not read EXIF-tags")
        }

        const p = this.panoramax
        sequenceId ??= this._targetSequence?.data ?? Constants.panoramax.sequence
        const sequence: { id: string; "stats:items": { count: number } } = (
            await p.mySequences()
        ).find((s) => s.id === sequenceId)
        const img = <ImageData>await p.addImage(blob, sequence, {
            lon,
            lat,
            datetime,
            isBlurred: noblur,
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
