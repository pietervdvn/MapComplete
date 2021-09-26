import {UIEventSource} from "../UIEventSource";
import {LicenseInfo} from "./Wikimedia";
import BaseUIElement from "../../UI/BaseUIElement";


export default abstract class ImageAttributionSource {

    private _cache = new Map<string, UIEventSource<LicenseInfo>>()

    GetAttributionFor(url: string): UIEventSource<LicenseInfo> {
        const cached = this._cache.get(url);
        if (cached !== undefined) {
            return cached;
        }
        const src = new UIEventSource(undefined)
        this._cache.set(url, src)
        this.DownloadAttribution(url).then(license =>
            src.setData(license))
            .catch(e => console.error("Could not download license information for ", url, " due to", e))
        return src;
    }


    public abstract SourceIcon(backlinkSource?: string): BaseUIElement;

    /*Converts a value to a URL. Can return null if not applicable*/
    public PrepareUrl(value: string): string | UIEventSource<string> {
        return value;
    }

    protected abstract DownloadAttribution(url: string): Promise<LicenseInfo>;

}