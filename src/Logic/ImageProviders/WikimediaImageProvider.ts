import ImageProvider, { ProvidedImage } from "./ImageProvider"
import BaseUIElement from "../../UI/BaseUIElement"
import { Utils } from "../../Utils"
import { LicenseInfo } from "./LicenseInfo"
import Wikimedia from "../Web/Wikimedia"
import SvelteUIElement from "../../UI/Base/SvelteUIElement"
import Wikimedia_commons_white from "../../assets/svg/Wikimedia_commons_white.svelte"

/**
 * This module provides endpoints for wikimedia and others
 */
export class WikimediaImageProvider extends ImageProvider {
    public static readonly singleton = new WikimediaImageProvider()
    public static readonly apiUrls = [
        "https://commons.wikimedia.org/wiki/",
        "https://upload.wikimedia.org",
    ]
    public static readonly commonsPrefixes = [...WikimediaImageProvider.apiUrls, "File:"]
    private readonly commons_key = "wikimedia_commons"
    public readonly defaultKeyPrefixes = [this.commons_key, "image"]

    private constructor() {
        super()
    }

    private static ExtractFileName(url: string) {
        if (!url.startsWith("http")) {
            return url
        }
        const path = new URL(url).pathname
        return path.substring(path.lastIndexOf("/") + 1)
    }

    private static PrepareUrl(value: string, useHd = false): string {
        if (value.toLowerCase().startsWith("https://commons.wikimedia.org/wiki/")) {
            return value
        }
        const baseUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
            value
        )}`
        if (useHd) {
            return baseUrl
        }
        return baseUrl + `?width=500&height=400`
    }

    private static startsWithCommonsPrefix(value: string): boolean {
        return WikimediaImageProvider.commonsPrefixes.some((prefix) => value.startsWith(prefix))
    }

    private static removeCommonsPrefix(value: string): string {
        if (value.startsWith("https://upload.wikimedia.org/")) {
            value = value.substring(value.lastIndexOf("/") + 1)
            value = decodeURIComponent(value)
            if (!value.startsWith("File:")) {
                value = "File:" + value
            }
            return value
        }

        for (const prefix of WikimediaImageProvider.commonsPrefixes) {
            if (value.startsWith(prefix)) {
                let part = value.substr(prefix.length)
                if (prefix.startsWith("http")) {
                    part = decodeURIComponent(part)
                }
                return part
            }
        }
        return value
    }

    apiUrls(): string[] {
        return WikimediaImageProvider.apiUrls
    }

    SourceIcon(): BaseUIElement {
        return new SvelteUIElement(Wikimedia_commons_white).SetStyle("width:2em;height: 2em")
    }

    public PrepUrl(value: string): ProvidedImage {
        value = WikimediaImageProvider.removeCommonsPrefix(value)

        if (value.startsWith("File:")) {
            return this.UrlForImage(value)
        }

        // We do a last effort and assume this is a file
        return this.UrlForImage("File:" + value)
    }

    public async ExtractUrls(key: string, value: string): Promise<Promise<ProvidedImage>[]> {
        const hasCommonsPrefix = WikimediaImageProvider.startsWithCommonsPrefix(value)
        if (key !== undefined && key !== this.commons_key && !hasCommonsPrefix) {
            return []
        }

        value = WikimediaImageProvider.removeCommonsPrefix(value)
        if (value.startsWith("Category:")) {
            const urls = await Wikimedia.GetCategoryContents(value)
            return urls
                .filter((url) => url.startsWith("File:"))
                .map((image) => Promise.resolve(this.UrlForImage(image)))
        }
        if (value.startsWith("File:")) {
            return [Promise.resolve(this.UrlForImage(value))]
        }
        if (value.startsWith("http")) {
            // PRobably an error
            return []
        }
        // We do a last effort and assume this is a file
        return [Promise.resolve(this.UrlForImage("File:" + value))]
    }

    public async DownloadAttribution(img: ProvidedImage): Promise<LicenseInfo> {
        const filename = WikimediaImageProvider.ExtractFileName(img.url)

        if (filename === "") {
            return undefined
        }

        const url =
            "https://en.wikipedia.org/w/" +
            "api.php?action=query&prop=imageinfo&iiprop=extmetadata&" +
            "titles=" +
            filename +
            "&format=json&origin=*"
        const data = await Utils.downloadJsonCached(url, 365 * 24 * 60 * 60)
        const licenseInfo = new LicenseInfo()
        const pageInfo = data.query.pages[-1]
        if (pageInfo === undefined) {
            return undefined
        }

        const license = (pageInfo.imageinfo ?? [])[0]?.extmetadata
        if (license === undefined) {
            console.warn(
                "The file",
                filename,
                "has no usable metedata or license attached... Please fix the license info file yourself!"
            )
            return undefined
        }

        let title = pageInfo.title
        if (title.startsWith("File:")) {
            title = title.substr("File:".length)
        }
        if (title.endsWith(".jpg") || title.endsWith(".png")) {
            title = title.substring(0, title.length - 4)
        }

        licenseInfo.title = title
        licenseInfo.artist = license.Artist?.value
        licenseInfo.license = license.License?.value
        licenseInfo.copyrighted = license.Copyrighted?.value
        licenseInfo.attributionRequired = license.AttributionRequired?.value
        licenseInfo.usageTerms = license.UsageTerms?.value
        licenseInfo.licenseShortName = license.LicenseShortName?.value
        licenseInfo.credit = license.Credit?.value
        licenseInfo.description = license.ImageDescription?.value
        licenseInfo.informationLocation = new URL("https://en.wikipedia.org/wiki/" + pageInfo.title)
        return licenseInfo
    }

    private UrlForImage(image: string): ProvidedImage {
        if (!image.startsWith("File:")) {
            image = "File:" + image
        }
        return {
            url: WikimediaImageProvider.PrepareUrl(image),
            url_hd: WikimediaImageProvider.PrepareUrl(image, true),
            key: undefined,
            provider: this,
            id: image,
        }
    }
}
