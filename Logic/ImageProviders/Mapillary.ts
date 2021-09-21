import {LicenseInfo} from "./Wikimedia";
import ImageAttributionSource from "./ImageAttributionSource";
import BaseUIElement from "../../UI/BaseUIElement";
import {UIEventSource} from "../UIEventSource";
import Svg from "../../Svg";
import {Utils} from "../../Utils";

export class Mapillary extends ImageAttributionSource {

    public static readonly singleton = new Mapillary();
    
    private static readonly v4_cached_urls = new Map<string, UIEventSource<string>>();

    private static readonly client_token_v3 = 'TXhLaWthQ1d4RUg0czVxaTVoRjFJZzowNDczNjUzNmIyNTQyYzI2'
    private static readonly client_token_v4 = "MLY|4441509239301885|b40ad2d3ea105435bd40c7e76993ae85"

    private constructor() {
        super();
    }

    private static ExtractKeyFromURL(value: string): {
        key: string,
        isApiv4?: boolean
    } {
        if (value.startsWith("https://a.mapillary.com")) {
            const key =  value.substring(0, value.lastIndexOf("?")).substring(value.lastIndexOf("/") + 1)
            return {key:key, isApiv4: !isNaN(Number(key))};
        }
        const newApiFormat = value.match(/https?:\/\/www.mapillary.com\/app\/\?pKey=([0-9]*)/)
        if (newApiFormat !== null) {
            return {key: newApiFormat[1], isApiv4: true}
        }

        const mapview = value.match(/https?:\/\/www.mapillary.com\/map\/im\/(.*)/)
        if(mapview !== null){
            const key = mapview[1]
            return {key:key, isApiv4: !isNaN(Number(key))};
        }
        

        if (value.toLowerCase().startsWith("https://www.mapillary.com/map/im/")) {
            // Extract the key of the image
            value = value.substring("https://www.mapillary.com/map/im/".length);
        }

        const matchApi = value.match(/https?:\/\/images.mapillary.com\/([^/]*)(&.*)?/)
        if (matchApi !== null) {
            return {key: matchApi[1]};
        }


        return {key: value, isApiv4: !isNaN(Number(value))};
    }

    SourceIcon(backlinkSource?: string): BaseUIElement {
        return Svg.mapillary_svg();
    }

    PrepareUrl(value: string): string | UIEventSource<string> {
        const keyV = Mapillary.ExtractKeyFromURL(value)
        if (!keyV.isApiv4) {
            return `https://images.mapillary.com/${keyV.key}/thumb-640.jpg?client_id=${Mapillary.client_token_v3}`
        } else {
            const key = keyV.key;
            if(Mapillary.v4_cached_urls.has(key)){
                return Mapillary.v4_cached_urls.get(key)
            }

            const metadataUrl ='https://graph.mapillary.com/' + key + '?fields=thumb_1024_url&&access_token=' + Mapillary.client_token_v4;
            const source = new UIEventSource<string>(undefined)
            Mapillary.v4_cached_urls.set(key, source)
            Utils.downloadJson(metadataUrl).then(
               json => {
                   console.warn("Got response on mapillary image", json, json["thumb_1024_url"])
                   return source.setData(json["thumb_1024_url"]);
               }
            )
            return source
        }
    }

    protected DownloadAttribution(url: string): UIEventSource<LicenseInfo> {

        const keyV = Mapillary.ExtractKeyFromURL(url)
        if(keyV.isApiv4){
            const license = new LicenseInfo()
            license.artist = "Contributor name unavailable";
            license.license = "CC BY-SA 4.0";
            // license.license = "Creative Commons Attribution-ShareAlike 4.0 International License";
            license.attributionRequired = true;
            return new UIEventSource<LicenseInfo>(license)
            
        }
        const key = keyV.key
        
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