import { Mapillary } from "./Mapillary"
import { WikimediaImageProvider } from "./WikimediaImageProvider"
import { Imgur } from "./Imgur"
import GenericImageProvider from "./GenericImageProvider"
import { Store, UIEventSource } from "../UIEventSource"
import ImageProvider, { ProvidedImage } from "./ImageProvider"
import { WikidataImageProvider } from "./WikidataImageProvider"
import Panoramax from "./Panoramax"

/**
 * A generic 'from the interwebz' image picker, without attribution
 */
export default class AllImageProviders {
    private static dontLoadFromPrefixes = ["https://photos.app.goo.gl/"]

    /**
     * The 'genericImageProvider' is a fallback that scans various other tags for tags, unless the URL starts with one of the given prefixes
     */
    public static genericImageProvider = new GenericImageProvider([
        ...Imgur.defaultValuePrefix,
        ...WikimediaImageProvider.commonsPrefixes,
        ...Mapillary.valuePrefixes,
        ...AllImageProviders.dontLoadFromPrefixes,
        "Category:",
    ])

    private static ImageAttributionSource: ImageProvider[] = [
        Imgur.singleton,
        Mapillary.singleton,
        WikidataImageProvider.singleton,
        WikimediaImageProvider.singleton,
        Panoramax.singleton,
        AllImageProviders.genericImageProvider,
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
        panoramax: Panoramax.singleton
    }
    private static _cache: Map<string, UIEventSource<ProvidedImage[]>> = new Map<
        string,
        UIEventSource<ProvidedImage[]>
    >()

    public static byName(name: string) {
        return AllImageProviders.providersByName[name.toLowerCase()]
    }

    public static async selectBestProvider(key: string, value: string): Promise<ImageProvider> {
        for (const imageProvider of AllImageProviders.ImageAttributionSource) {
            try {
                const extracted = await Promise.all(await imageProvider.ExtractUrls(key, value))
                if (extracted?.length > 0) {
                    return imageProvider
                }
            } catch (e) {
                console.warn("Provider gave an error while trying to determine a match:", e)
            }
        }

        return AllImageProviders.genericImageProvider
    }

    /**
     * Tries to extract all image data for this image
     */
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
        const allSources: Store<ProvidedImage[]>[] = []
        for (const imageProvider of AllImageProviders.ImageAttributionSource) {


            const singleSource = imageProvider.GetRelevantUrls(tags, {
                /*
                 By default, 'GetRelevantUrls' uses the defaultKeyPrefixes.
                 However, we override them if a custom image tag is set, e.g. 'image:menu'
                */
                prefixes: tagKey ?? imageProvider.defaultKeyPrefixes,
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
