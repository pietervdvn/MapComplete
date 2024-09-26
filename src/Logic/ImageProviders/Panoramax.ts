import { ImageUploader } from "./ImageUploader"
import { AuthorizedPanoramax } from "panoramax-js/dist"
import ExifReader from "exifreader"
import ImageProvider, { ProvidedImage } from "./ImageProvider"
import BaseUIElement from "../../UI/BaseUIElement"
import { LicenseInfo } from "./LicenseInfo"
import { Utils } from "../../Utils"
import { Feature, FeatureCollection, Point } from "geojson"
import { GeoOperations } from "../GeoOperations"

type ImageData = Feature<Point, { "geovisio:producer": string, "geovisio:license": string, "datetime": string }> & {
    id: string,
    assets: { hd: { href: string }, sd: { href: string } },
    providers: {name: string}[]
}

export default class PanoramaxImageProvider extends ImageProvider {

    public static readonly singleton = new PanoramaxImageProvider()

    public defaultKeyPrefixes: string[] = ["panoramax", "image"]
    public readonly name: string = "panoramax"

    private static knownMeta: Record<string, ImageData> = {}

    public SourceIcon(id?: string, location?: { lon: number; lat: number; }): BaseUIElement {
        return undefined
    }

    public addKnownMeta(meta: ImageData){
        console.log("Adding known meta for", meta.id)
        PanoramaxImageProvider.knownMeta[meta.id] = meta
    }

    /**
     * Tries to get the entry from the mapcomplete-panoramax instance. Might return undefined
     * @param id
     * @private
     */
    private async getInfoFromMapComplete(id: string): Promise<{ data: ImageData, url: string }> {
        const sequence = "6e702976-580b-419c-8fb3-cf7bd364e6f8" // We always reuse this sequence
        const url = `https://panoramax.mapcomplete.org/api/collections/${sequence}/items/${id}`
        const data = <any> await Utils.downloadJsonCached(url, 60 * 60 * 1000)
        return {url, data}
    }

    private async getInfoFromXYZ(imageId: string): Promise<{ data: ImageData, url: string }> {
        const url = "https://api.panoramax.xyz/api/search?limit=1&ids=" + imageId
        const metaAll = await Utils.downloadJsonCached<FeatureCollection<Point>>(url, 1000 * 60 * 60)
        const data= <any>metaAll.features[0]
        return {data, url}
    }


    /**
     * Reads a geovisio-somewhat-looking-like-geojson object and converts it to a provided image
     * @param meta
     * @private
     */
    private featureToImage(info: {data: ImageData, url: string}) {
        const meta = info.data
        const url = info.url
        if (!meta) {
            return undefined
        }

        function makeAbsolute(s: string){
            if(!s.startsWith("https://") && !s.startsWith("http://")){
                 const parsed = new URL(url)
                return parsed.protocol+"//"+parsed.host+s
            }
            return s
        }

        const [lon, lat] = GeoOperations.centerpointCoordinates(meta)
        return <ProvidedImage>{
            id: meta.id,
            url: makeAbsolute(meta.assets.sd.href),
            url_hd: makeAbsolute(meta.assets.hd.href),
            lon, lat,
            key: "panoramax",
            provider: this,
            rotation: Number(meta.properties["view:azimuth"]),
            date: new Date(meta.properties.datetime),
        }
    }

    private async getInfoFor(id: string): Promise<{ data: ImageData, url: string }> {
        const cached=  PanoramaxImageProvider.knownMeta[id]
        console.log("Cached version", id, cached)
        if(cached){
            return {data: cached, url: undefined}
        }
        try {
            return await this.getInfoFromMapComplete(id)
        } catch (e) {
            return await this.getInfoFromXYZ(id)
        }
    }


    public async ExtractUrls(key: string, value: string): Promise<Promise<ProvidedImage>[]> {
        return [this.getInfoFor(value).then(r => this.featureToImage(<any>r))]
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

    constructor(url: string, token: string) {
        this._panoramax = new AuthorizedPanoramax(url, token)
    }

    async uploadImage(blob: File, currentGps: [number, number], author: string): Promise<{
        key: string;
        value: string;
    }> {

        const tags = await ExifReader.load(blob)
        const hasDate = tags.DateTime !== undefined
        const hasGPS = tags.GPSLatitude !== undefined && tags.GPSLongitude !== undefined

        const [lon, lat] = currentGps

        const p = this._panoramax
        const defaultSequence = (await p.mySequences())[0]
        const img = <ImageData> await p.addImage(blob, defaultSequence, {
            lat: !hasGPS ? lat : undefined,
            lon: !hasGPS ? lon : undefined,
            datetime: !hasDate ? new Date().toISOString() : undefined,
            exifOverride: {
                Artist: author,
            },

        })
        PanoramaxImageProvider.singleton.addKnownMeta(img)
        await Utils.waitFor(1250)
        return {
            key: "panoramax",
            value: img.id,
        }
    }

}
