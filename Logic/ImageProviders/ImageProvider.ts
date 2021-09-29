import {UIEventSource} from "../UIEventSource";
import BaseUIElement from "../../UI/BaseUIElement";
import {LicenseInfo} from "./LicenseInfo";

export interface ProvidedImage {
    url: string, key: string, provider: ImageProvider
}

export default abstract class ImageProvider {
    
    protected abstract readonly defaultKeyPrefixes : string[]
    
    private _cache = new Map<string, UIEventSource<LicenseInfo>>()
    
    GetAttributionFor(url: string): UIEventSource<LicenseInfo> {
        const cached = this._cache.get(url);
        if (cached !== undefined) {
            return cached;
        }
        const src =UIEventSource.FromPromise(this.DownloadAttribution(url))
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
    }):UIEventSource<ProvidedImage[]> {
        const prefixes = options?.prefixes ?? this.defaultKeyPrefixes
        const relevantUrls = new UIEventSource<{ url: string; key: string; provider: ImageProvider }[]>([])
        const seenValues = new Set<string>()
        allTags.addCallbackAndRunD(tags => {
            for (const key in tags) {
                if(!prefixes.some(prefix => key.startsWith(prefix))){
                    continue
                }
                const value = tags[key]
                if(seenValues.has(value)){
                    continue
                }
                seenValues.add(value)

                this.ExtractUrls(key, value).then(promises => {
                    for (const promise of promises) {
                        promise.then(providedImage => {
                            relevantUrls.data.push(providedImage)
                            relevantUrls.ping()
                        })
                    }
                })
            }
        })
        return relevantUrls
    }

    public abstract ExtractUrls(key: string, value: string) : Promise<Promise<ProvidedImage>[]>;
    
}