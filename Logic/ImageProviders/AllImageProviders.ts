import {Mapillary} from "./Mapillary";
import {WikimediaImageProvider} from "./WikimediaImageProvider";
import {Imgur} from "./Imgur";
import GenericImageProvider from "./GenericImageProvider";
import {UIEventSource} from "../UIEventSource";
import ImageProvider, {ProvidedImage} from "./ImageProvider";
import {WikidataImageProvider} from "./WikidataImageProvider";

/**
 * A generic 'from the interwebz' image picker, without attribution
 */
export default class AllImageProviders {

    public static ImageAttributionSource: ImageProvider[] = [
        Imgur.singleton,
        Mapillary.singleton,
        WikidataImageProvider.singleton,
        WikimediaImageProvider.singleton,
        new GenericImageProvider(
            [].concat(...Imgur.defaultValuePrefix, ...WikimediaImageProvider.commonsPrefixes, ...Mapillary.valuePrefixes)
        )
            
    ]


    private static _cache: Map<string, UIEventSource<ProvidedImage[]>> = new Map<string, UIEventSource<ProvidedImage[]>>()

    public static LoadImagesFor(tags: UIEventSource<any>, tagKey?: string): UIEventSource<ProvidedImage[]> {
        if (tags.data.id === undefined) {
            return undefined;
        }

        const cacheKey = tags.data.id+tagKey
        const cached = this._cache.get(cacheKey)
        if (cached !== undefined) {
            return cached
        }


        const source = new UIEventSource([])
        this._cache.set(cacheKey, source)
        const allSources = []
        for (const imageProvider of AllImageProviders.ImageAttributionSource) {
            
            let prefixes = imageProvider.defaultKeyPrefixes
            if(tagKey !== undefined){
                prefixes = [tagKey]
            }
            
            const singleSource = imageProvider.GetRelevantUrls(tags, {
                prefixes: prefixes
            })
            allSources.push(singleSource)
            singleSource.addCallbackAndRunD(_ => {
                const all : ProvidedImage[] = [].concat(...allSources.map(source => source.data))
                const uniq = []
                const seen = new Set<string>()
                for (const img of all) {
                    if(seen.has(img.url)){
                        continue
                    }
                    seen.add(img.url)
                    uniq.push(img)
                }
                source.setData(uniq)
            })
        }
        return source;
    }

}