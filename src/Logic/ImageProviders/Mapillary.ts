import ImageProvider, { ProvidedImage } from "./ImageProvider"
import BaseUIElement from "../../UI/BaseUIElement"
import Svg from "../../Svg"
import { Utils } from "../../Utils"
import { LicenseInfo } from "./LicenseInfo"
import Constants from "../../Models/Constants"
import Link from "../../UI/Base/Link"

export class Mapillary extends ImageProvider {
    public static readonly singleton = new Mapillary()
    private static readonly valuePrefix = "https://a.mapillary.com"
    public static readonly valuePrefixes = [
        Mapillary.valuePrefix,
        "http://mapillary.com",
        "https://mapillary.com",
        "http://www.mapillary.com",
        "https://www.mapillary.com",
    ]
    defaultKeyPrefixes = ["mapillary", "image"]

    /**
     * Indicates that this is the same URL
     * Ignores 'stp' parameter
     *
     * const a = "https://scontent-bru2-1.xx.fbcdn.net/m1/v/t6/An8xm5SGLt20ETziNqzhhBd8b8S5GHLiIu8N6BbyqHFohFAQoaJJPG8i5yQiSwjYmEqXSfVeoCmpiyBJICEkQK98JOB21kkJoBS8VdhYa-Ty93lBnznQyesJBtKcb32foGut2Hgt10hEMWJbE3dDgA?stp=s1024x768&ccb=10-5&oh=00_AT-ZGTXHzihoaQYBILmEiAEKR64z_IWiTlcAYq_D7Ka0-Q&oe=6278C456&_nc_sid=122ab1"
     * const b = "https://scontent-bru2-1.xx.fbcdn.net/m1/v/t6/An8xm5SGLt20ETziNqzhhBd8b8S5GHLiIu8N6BbyqHFohFAQoaJJPG8i5yQiSwjYmEqXSfVeoCmpiyBJICEkQK98JOB21kkJoBS8VdhYa-Ty93lBnznQyesJBtKcb32foGut2Hgt10hEMWJbE3dDgA?stp=s256x192&ccb=10-5&oh=00_AT9BZ1Rpc9zbY_uNu92A_4gj1joiy1b6VtgtLIu_7wh9Bg&oe=6278C456&_nc_sid=122ab1"
     * Mapillary.sameUrl(a, b) => true
     */
    static sameUrl(a: string, b: string): boolean {
        if (a === b) {
            return true
        }
        try {
            const aUrl = new URL(a)
            const bUrl = new URL(b)
            if (aUrl.host !== bUrl.host || aUrl.pathname !== bUrl.pathname) {
                return false
            }
            let allSame = true
            aUrl.searchParams.forEach((value, key) => {
                if (key === "stp") {
                    // This is the key indicating the image size on mapillary; we ignore it
                    return
                }
                if (value !== bUrl.searchParams.get(key)) {
                    allSame = false
                    return
                }
            })
            return allSame
        } catch (e) {
            console.debug("Could not compare ", a, "and", b, "due to", e)
        }
        return false
    }

    static createLink(location: {
        lon: number,
        lat: number
    } = undefined, zoom: number = 17, pKey?: string) {
        const params = {
            focus: pKey === undefined ? "map" : "photo",
            lat: location.lat,
            lng: location.lon,
            z: location === undefined ? undefined : Math.max((zoom ?? 2) - 1, 1),
            pKey,
        }
        const baselink = `https://www.mapillary.com/app/?`
        const paramsStr = Utils.NoNull(Object.keys(params).map(k => params[k] === undefined ? undefined : k + "=" + params[k]))
        return baselink + paramsStr.join("&")
    }

    /**
     * Returns the correct key for API v4.0
     */
    private static ExtractKeyFromURL(value: string): number {
        let key: string

        const newApiFormat = value.match(/https?:\/\/www.mapillary.com\/app\/\?pKey=([0-9]*)/)
        if (newApiFormat !== null) {
            key = newApiFormat[1]
        } else if (value.startsWith(Mapillary.valuePrefix)) {
            key = value.substring(0, value.lastIndexOf("?")).substring(value.lastIndexOf("/") + 1)
        } else if (value.match("[0-9]*")) {
            key = value
        }

        const keyAsNumber = Number(key)
        if (!isNaN(keyAsNumber)) {
            return keyAsNumber
        }

        return undefined
    }

    apiUrls(): string[] {
        return ["https://mapillary.com", "https://www.mapillary.com", "https://graph.mapillary.com"]
    }

    SourceIcon(id: string, location?: {
        lon: number,
        lat: number
    }): BaseUIElement {
        const icon = Svg.mapillary_svg()
        if (!id) {
            return icon
        }
        return new Link(icon, Mapillary.createLink(location, 16, "" + id), true)
    }

    async ExtractUrls(key: string, value: string): Promise<Promise<ProvidedImage>[]> {
        return [this.PrepareUrlAsync(key, value)]
    }

    public async DownloadAttribution(url: string): Promise<LicenseInfo> {
        const license = new LicenseInfo()
        license.artist = undefined
        license.license = "CC BY-SA 4.0"
        // license.license = "Creative Commons Attribution-ShareAlike 4.0 International License";
        license.attributionRequired = true
        return license
    }

    private async PrepareUrlAsync(key: string, value: string): Promise<ProvidedImage> {
        const mapillaryId = Mapillary.ExtractKeyFromURL(value)
        if (mapillaryId === undefined) {
            return undefined
        }

        const metadataUrl =
            "https://graph.mapillary.com/" +
            mapillaryId +
            "?fields=thumb_1024_url&&access_token=" +
            Constants.mapillary_client_token_v4
        const response = await Utils.downloadJsonCached(metadataUrl, 60 * 60)
        const url = <string>response["thumb_1024_url"]
        return {
            id: "" + mapillaryId,
            url: url,
            provider: this,
            key: key,
        }
    }
}
