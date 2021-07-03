import $ from "jquery"
import {LicenseInfo} from "./Wikimedia";
import ImageAttributionSource from "./ImageAttributionSource";
import BaseUIElement from "../../UI/BaseUIElement";
import {UIEventSource} from "../UIEventSource";
import Svg from "../../Svg";
import {Utils} from "../../Utils";

export class Mapillary extends ImageAttributionSource {

    public static readonly singleton = new Mapillary();

    private constructor() {
        super();
    }

    private static ExtractKeyFromURL(value: string) {
        if (value.startsWith("https://a.mapillary.com")) {
            return value.substring(0, value.lastIndexOf("?")).substring(value.lastIndexOf("/") + 1);
        }
        const matchApi = value.match(/https?:\/\/images.mapillary.com\/([^/]*)/)
        if (matchApi !== null) {
            return matchApi[1];
        }

        if (value.toLowerCase().startsWith("https://www.mapillary.com/map/im/")) {
            // Extract the key of the image
            value = value.substring("https://www.mapillary.com/map/im/".length);
        }
        return value;
    }

    SourceIcon(backlinkSource?: string): BaseUIElement {
        return Svg.mapillary_svg();
    }

    PrepareUrl(value: string): string {
        const key = Mapillary.ExtractKeyFromURL(value)
        return `https://images.mapillary.com/${key}/thumb-640.jpg?client_id=TXhLaWthQ1d4RUg0czVxaTVoRjFJZzowNDczNjUzNmIyNTQyYzI2`
    }

    protected DownloadAttribution(url: string): UIEventSource<LicenseInfo> {

        const key = Mapillary.ExtractKeyFromURL(url)
        const metadataURL = `https://a.mapillary.com/v3/images/${key}?client_id=TXhLaWthQ1d4RUg0czVxaTVoRjFJZzowNDczNjUzNmIyNTQyYzI2`
        const source = new UIEventSource<LicenseInfo>(undefined)
        Utils.downloadJson(metadataURL).then(data => {
            const license = new LicenseInfo();
            license.artist = data.properties?.username;
            license.licenseShortName = "CC BY-SA 4.0";
            license.license = "Creative Commons Attribution-ShareAlike 4.0 International License";
            license.attributionRequired = true;
            source.setData(license);
        })

        return source
    }
}