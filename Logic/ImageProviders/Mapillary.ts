import ImageProvider, {ProvidedImage} from "./ImageProvider";
import BaseUIElement from "../../UI/BaseUIElement";
import Svg from "../../Svg";
import {Utils} from "../../Utils";
import {LicenseInfo} from "./LicenseInfo";
import Constants from "../../Models/Constants";

export class Mapillary extends ImageProvider {

    public static readonly singleton = new Mapillary();
    private static readonly valuePrefix = "https://a.mapillary.com"
    public static readonly valuePrefixes = [Mapillary.valuePrefix, "http://mapillary.com", "https://mapillary.com", "http://www.mapillary.com", "https://www.mapillary.com"]
    defaultKeyPrefixes = ["mapillary", "image"]

    /**
     * Returns the correct key for API v4.0
     */
    private static ExtractKeyFromURL(value: string): number {

        let key: string;

        const newApiFormat = value.match(/https?:\/\/www.mapillary.com\/app\/\?pKey=([0-9]*)/)
        if (newApiFormat !== null) {
            key = newApiFormat[1]
        } else if (value.startsWith(Mapillary.valuePrefix)) {
            key = value.substring(0, value.lastIndexOf("?")).substring(value.lastIndexOf("/") + 1)
        }

        const keyAsNumber = Number(key)
        if (!isNaN(keyAsNumber)) {
            return keyAsNumber
        }

        return undefined
    }

    SourceIcon(backlinkSource?: string): BaseUIElement {
        return Svg.mapillary_svg();
    }

    async ExtractUrls(key: string, value: string): Promise<Promise<ProvidedImage>[]> {
        return [this.PrepareUrlAsync(key, value)]
    }

    protected async DownloadAttribution(url: string): Promise<LicenseInfo> {
        const license = new LicenseInfo()
        license.artist = "Contributor name unavailable";
        license.license = "CC BY-SA 4.0";
        // license.license = "Creative Commons Attribution-ShareAlike 4.0 International License";
        license.attributionRequired = true;
        return license
    }

    private async PrepareUrlAsync(key: string, value: string): Promise<ProvidedImage> {
        const mapillaryId = Mapillary.ExtractKeyFromURL(value)
        if (mapillaryId === undefined) {
            return undefined;
        }

        const metadataUrl = 'https://graph.mapillary.com/' + mapillaryId + '?fields=thumb_1024_url&&access_token=' + Constants.mapillary_client_token_v4;
        const response = await Utils.downloadJson(metadataUrl)
        const url = <string>response["thumb_1024_url"];
        return {
            url: url,
            provider: this,
            key: key
        }
    }
}