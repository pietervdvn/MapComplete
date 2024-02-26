import { Mapillary } from "./Mapillary"
import { WikimediaImageProvider } from "./WikimediaImageProvider"
import { Imgur } from "./Imgur"
import GenericImageProvider from "./GenericImageProvider"
import { Store, UIEventSource } from "../UIEventSource"
import ImageProvider, { ProvidedImage } from "./ImageProvider"
import { WikidataImageProvider } from "./WikidataImageProvider"

/**
 * A generic 'from the interwebz' image picker, without attribution
 */
export default class AllImageProviders {
    private static dontLoadFromPrefixes = ["https://photos.app.goo.gl/"]

    public static ImageAttributionSource: ImageProvider[] = [
        Imgur.singleton,
        Mapillary.singleton,
        WikidataImageProvider.singleton,
        WikimediaImageProvider.singleton,
        new GenericImageProvider(
            [].concat(
                ...Imgur.defaultValuePrefix,
                ...WikimediaImageProvider.commonsPrefixes,
                ...Mapillary.valuePrefixes,
                ...AllImageProviders.dontLoadFromPrefixes
            )
        ),
    ]
    public static apiUrls: string[] = [].concat(
        ...AllImageProviders.ImageAttributionSource.map((src) => src.apiUrls())
    )
    public static defaultKeys = [].concat(
        AllImageProviders.ImageAttributionSource.map((provider) => provider.defaultKeyPrefixes)
    )
    private static providersByName = {
        imgur: Imgur.singleton,
        mapillary: Mapillary.singleton,
        wikidata: WikidataImageProvider.singleton,
        wikimedia: WikimediaImageProvider.singleton,
    }
    private static _cache: Map<string, UIEventSource<ProvidedImage[]>> = new Map<
        string,
        UIEventSource<ProvidedImage[]>
    >()

    public static byName(name: string) {
        return AllImageProviders.providersByName[name.toLowerCase()]
    }

    public static LoadImagesFor(
        tags: Store<Record<string, string>>,
        tagKey?: string[]
    ): Store<ProvidedImage[]> {
        if (tags.data.id === undefined) {
            return undefined
        }

        const cacheKey = tags.data.id + tagKey
        const cached = this._cache.get(cacheKey)
        if (cached !== undefined) {
            return cached
        }

        const source = new UIEventSource([])
        this._cache.set(cacheKey, source)
        const allSources = []
        for (const imageProvider of AllImageProviders.ImageAttributionSource) {
            let prefixes = imageProvider.defaultKeyPrefixes
            if (tagKey !== undefined) {
                prefixes = tagKey
            }

            const singleSource = imageProvider.GetRelevantUrls(tags, {
                prefixes: prefixes,
            })
            allSources.push(singleSource)
            singleSource.addCallbackAndRunD((_) => {
                const all: ProvidedImage[] = [].concat(...allSources.map((source) => source.data))
                const uniq = []
                const seen = new Set<string>()
                for (const img of all) {
                    if (seen.has(img.url)) {
                        continue
                    }
                    seen.add(img.url)
                    uniq.push(img)
                }
                source.setData(uniq)
            })
        }
        return source
    }
}
