import { Mapillary } from "./Mapillary"
import { WikimediaImageProvider } from "./WikimediaImageProvider"
import { Imgur } from "./Imgur"
import GenericImageProvider from "./GenericImageProvider"
import { ImmutableStore, Store, UIEventSource } from "../UIEventSource"
import ImageProvider, { ProvidedImage } from "./ImageProvider"
import { WikidataImageProvider } from "./WikidataImageProvider"
import Panoramax from "./Panoramax"
import { Utils } from "../../Utils"

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
        panoramax: Panoramax.singleton,
    }

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

    private static readonly _cachedImageStores: Record<string, Store<ProvidedImage[]>> = {}
    /**
     * Tries to extract all image data for this image. Cachedon tags?.data?.id
     */
    public static LoadImagesFor(
        tags: Store<Record<string, string>>,
        tagKey?: string[]
    ): Store<ProvidedImage[]> {
        if (tags?.data?.id === undefined) {
            return undefined
        }
        const id = tags?.data?.id
        if(this._cachedImageStores[id]){
            return this._cachedImageStores[id]
        }

        const source = new UIEventSource([])
        const allSources: Store<ProvidedImage[]>[] = []
        for (const imageProvider of AllImageProviders.ImageAttributionSource) {
            /*
                By default, 'GetRelevantUrls' uses the defaultKeyPrefixes.
                However, we override them if a custom image tag is set, e.g. 'image:menu'
               */
            const prefixes = tagKey ?? imageProvider.defaultKeyPrefixes
            const singleSource = tags.bindD((tags) => imageProvider.getRelevantUrls(tags, prefixes))
            allSources.push(singleSource)
            singleSource.addCallbackAndRunD((_) => {
                const all: ProvidedImage[] = [].concat(...allSources.map((source) => source.data))
                const dedup = Utils.DedupOnId(all, (i) => i?.id ?? i?.url)
                source.set(dedup)
            })
        }
        this._cachedImageStores[id] = source
        return source
    }

    /**
     * Given a list of URLs, tries to detect the images. Used in e.g. the comments
     * @param url
     */
    public static loadImagesFrom(urls: string[]): Store<ProvidedImage[]> {
        const tags = {
            id: "na",
        }
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i]
            tags["image:" + i] = url
        }
        return this.LoadImagesFor(new ImmutableStore(tags))
    }
}
