import {UIEventSource} from "../UIEventSource";
import BaseUIElement from "../../UI/BaseUIElement";
import {LicenseInfo} from "./LicenseInfo";
import {Utils} from "../../Utils";

export interface ProvidedImage {
    url: string,
    key: string,
    provider: ImageProvider
}

export default abstract class ImageProvider {

    public abstract readonly defaultKeyPrefixes: string[] = ["mapillary", "image"]

    private _cache = new Map<string, UIEventSource<LicenseInfo>>()

    GetAttributionFor(url: string): UIEventSource<LicenseInfo> {
        const cached = this._cache.get(url);
        if (cached !== undefined) {
            return cached;
        }
        const src = UIEventSource.FromPromise(this.DownloadAttribution(url))
        this._cache.set(url, src)
        return src;
    }

    public abstract SourceIcon(backlinkSource?: string): BaseUIElement;

    protected abstract DownloadAttribution(url: string): Promise<LicenseInfo>;

    /**
     * Given a properies object, maps it onto _all_ the available pictures for this imageProvider
     */
    public GetRelevantUrls(allTags: UIEventSource<any>, options?: {
        prefixes?: string[]
    }): UIEventSource<ProvidedImage[]> {
        const prefixes = options?.prefixes ?? this.defaultKeyPrefixes
        if (prefixes === undefined) {
            throw "The image provider" + this.constructor.name + " doesn't define `defaultKeyPrefixes`"
        }
        const relevantUrls = new UIEventSource<{ url: string; key: string; provider: ImageProvider }[]>([])
        const seenValues = new Set<string>()
        const self =this
        allTags.addCallbackAndRunD(tags => {
            for (const key in tags) {
                if (!prefixes.some(prefix => key.startsWith(prefix))) {
                    continue
                }
                const values = Utils.NoEmpty(tags[key]?.split(";")?.map(v => v.trim()) ?? [])
                for (const value of values) {

                    if (seenValues.has(value)) {
                        continue
                    }
                    seenValues.add(value)
                    this.ExtractUrls(key, value).then(promises => {
                        for (const promise of promises ?? []) {
                            if (promise === undefined) {
                                continue
                            }
                            promise.then(providedImage => {
                                if (providedImage === undefined) {
                                    return
                                }
                                relevantUrls.data.push(providedImage)
                                relevantUrls.ping()
                            })
                        }
                    })
                }


            }
        })
        return relevantUrls
    }

    public abstract ExtractUrls(key: string, value: string): Promise<Promise<ProvidedImage>[]>;

}