import ImageProvider, { ProvidedImage } from "./ImageProvider"
import BaseUIElement from "../../UI/BaseUIElement"
import { Utils } from "../../Utils"
import Constants from "../../Models/Constants"
import { LicenseInfo } from "./LicenseInfo"

export class Imgur extends ImageProvider {
    public static readonly defaultValuePrefix = ["https://i.imgur.com"]
    public static readonly singleton = new Imgur()
    public readonly name = "Imgur"
    public readonly defaultKeyPrefixes: string[] = ["image"]
    public static readonly apiUrl = "https://api.imgur.com/3/image"
    public static readonly supportingUrls = ["https://i.imgur.com"]
    private constructor() {
        super()
    }

    apiUrls(): string[] {
        return [Imgur.apiUrl]
    }


    SourceIcon(): BaseUIElement {
        return undefined
    }

    public ExtractUrls(key: string, value: string): undefined | ProvidedImage[] {
        if (Imgur.defaultValuePrefix.some((prefix) => value.startsWith(prefix))) {
            return [
                {
                    url: value,
                    key: key,
                    provider: this,
                    id: value,
                }
            ]
        }
        return undefined
    }

    /**
     * Download the attribution and license info for the picture at the given URL
     *
     * const data = {"data":{"id":"I9t6B7B","title":"Station Knokke","description":"author:Pieter Vander Vennet\r\nlicense:CC-BY 4.0\r\nosmid:node\/9812712386","datetime":1655052078,"type":"image\/jpeg","animated":false,"width":2400,"height":1795,"size":910872,"views":2,"bandwidth":1821744,"vote":null,"favorite":false,"nsfw":false,"section":null,"account_url":null,"account_id":null,"is_ad":false,"in_most_viral":false,"has_sound":false,"tags":[],"ad_type":0,"ad_url":"","edited":"0","in_gallery":false,"link":"https:\/\/i.imgur.com\/I9t6B7B.jpg","ad_config":{"safeFlags":["not_in_gallery","share"],"highRiskFlags":[],"unsafeFlags":["sixth_mod_unsafe"],"wallUnsafeFlags":[],"showsAds":false,"showAdLevel":1}},"success":true,"status":200}
     * Utils.injectJsonDownloadForTests("https://api.imgur.com/3/image/E0RuAK3", data)
     * const licenseInfo = await Imgur.singleton.DownloadAttribution({url: "https://i.imgur.com/E0RuAK3.jpg"})
     * const expected = new LicenseInfo()
     * expected.licenseShortName = "CC-BY 4.0"
     * expected.artist = "Pieter Vander Vennet"
     * expected.date = new Date(1655052078000)
     * expected.views = 2
     * licenseInfo // => expected
     * const licenseInfoJpeg = await Imgur.singleton.DownloadAttribution({url:"https://i.imgur.com/E0RuAK3.jpeg"})
     * licenseInfoJpeg // => expected
     * const licenseInfoUpperCase = await Imgur.singleton.DownloadAttribution({url: "https://i.imgur.com/E0RuAK3.JPEG"})
     * licenseInfoUpperCase // => expected
     *
     *
     */
    public async DownloadAttribution(providedImage: { url: string }): Promise<LicenseInfo> {
        const url = providedImage.url
        const hash = url.substr("https://i.imgur.com/".length).split(/\.jpe?g/i)[0]

        const apiUrl = "https://api.imgur.com/3/image/" + hash
        const response = await Utils.downloadJsonCached<{
            data: { description: string; datetime: string; views: number }
        }>(apiUrl, 365 * 24 * 60 * 60, {
            Authorization: "Client-ID " + Constants.ImgurApiKey,
        })

        const descr = response.data.description ?? ""
        const data: any = {}
        const imgurData = response.data

        for (const tag of descr.split("\n")) {
            const kv = tag.split(":")
            const k = kv[0]
            data[k] = kv[1]?.replace(/\r/g, "")
        }

        const licenseInfo = new LicenseInfo()

        licenseInfo.licenseShortName = data.license
        licenseInfo.artist = data.author
        licenseInfo.date = new Date(Number(imgurData.datetime) * 1000)
        licenseInfo.views = imgurData.views

        return licenseInfo
    }
}
