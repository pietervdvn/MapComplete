import { IndexedFeatureSource } from "../FeatureSource/FeatureSource"
import { GeoOperations } from "../GeoOperations"
import { ImmutableStore, Store, Stores, UIEventSource } from "../UIEventSource"
import P4C from "pic4carto"
import { Utils } from "../../Utils"

export interface NearbyImageOptions {
    lon: number
    lat: number
    // Radius of the upstream search
    searchRadius?: 500 | number
    maxDaysOld?: 1095 | number
    blacklist: Store<{ url: string }[]>
    shownImagesCount?: UIEventSource<number>
    towardscenter?: UIEventSource<boolean>
    allowSpherical?: UIEventSource<boolean>
    // Radius of what is shown. Useless to select a value > searchRadius; defaults to searchRadius
    shownRadius?: UIEventSource<number>
}

export interface P4CPicture {
    pictureUrl: string
    date?: number
    coordinates: { lat: number; lng: number }
    provider: "Mapillary" | string
    author?
    license?
    detailsUrl?: string
    direction?
    osmTags?: object /*To copy straight into OSM!*/
    thumbUrl: string
    details: {
        isSpherical: boolean
    }
}

/**
 * Uses Pic4Carto to fetch nearby images from various providers
 */
export default class NearbyImagesSearch {
    public static readonly services = ["mapillary", "flickr", "kartaview", "wikicommons"] as const
    public static readonly apiUrls = ["https://api.flickr.com"]
    private readonly individualStores: Store<
        { images: P4CPicture[]; beforeFilter: number } | undefined
    >[]
    private readonly _store: UIEventSource<P4CPicture[]> = new UIEventSource<P4CPicture[]>([])
    public readonly store: Store<P4CPicture[]> = this._store
    public readonly allDone: Store<boolean>
    private readonly _options: NearbyImageOptions

    constructor(options: NearbyImageOptions, features: IndexedFeatureSource) {
        this.individualStores = NearbyImagesSearch.services.map((s) =>
            NearbyImagesSearch.buildPictureFetcher(options, s)
        )

        const allDone = new UIEventSource(false)
        this.allDone = allDone
        const self = this
        function updateAllDone() {
            const stillRunning = self.individualStores.some((store) => store.data === undefined)
            allDone.setData(!stillRunning)
        }
        self.individualStores.forEach((s) => s.addCallback((_) => updateAllDone()))

        this._options = options
        if (features !== undefined) {
            const osmImages = new ImagesInLoadedDataFetcher(features).fetchAround({
                lat: options.lat,
                lon: options.lon,
                searchRadius: options.searchRadius ?? 100,
            })
            this.individualStores.push(
                new ImmutableStore({ images: osmImages, beforeFilter: osmImages.length })
            )
        }
        for (const source of this.individualStores) {
            source.addCallback(() => this.update())
        }
        this.update()
    }

    private static async fetchImages(
        options: NearbyImageOptions,
        fetcher: P4CService
    ): Promise<P4CPicture[]> {
        const picManager = new P4C.PicturesManager({ usefetchers: [fetcher] })
        const maxAgeSeconds = (options.maxDaysOld ?? 3 * 365) * 24 * 60 * 60 * 1000
        const searchRadius = options.searchRadius ?? 100

        try {
            const pics: P4CPicture[] = await picManager.startPicsRetrievalAround(
                new P4C.LatLng(options.lat, options.lon),
                searchRadius,
                {
                    mindate: new Date().getTime() - maxAgeSeconds,
                    towardscenter: false,
                }
            )
            return pics
        } catch (e) {
            console.error("Could not fetch images from service", fetcher, e)
            return []
        }
    }

    private static buildPictureFetcher(
        options: NearbyImageOptions,
        fetcher: P4CService
    ): Store<{ images: P4CPicture[]; beforeFilter: number } | null | undefined> {
        const p4cStore = Stores.FromPromiseWithErr<P4CPicture[]>(
            NearbyImagesSearch.fetchImages(options, fetcher)
        )
        const searchRadius = options.searchRadius ?? 100
        return p4cStore.mapD(
            (imagesState) => {
                if (imagesState["error"]) {
                    return null
                }
                let images = imagesState["success"]
                if (images === undefined) {
                    return undefined
                }
                const beforeFilterCount = images.length
                if (!options?.allowSpherical?.data) {
                    images = images?.filter((i) => i.details.isSpherical !== true)
                }

                const shownRadius = options?.shownRadius?.data ?? searchRadius
                if (shownRadius !== searchRadius) {
                    images = images.filter((i) => {
                        const d = GeoOperations.distanceBetween(
                            [i.coordinates.lng, i.coordinates.lat],
                            [options.lon, options.lat]
                        )
                        return d <= shownRadius
                    })
                }
                if (options.towardscenter?.data) {
                    images = images.filter((i) => {
                        if (i.direction === undefined || isNaN(i.direction)) {
                            return false
                        }
                        const bearing = GeoOperations.bearing(
                            [i.coordinates.lng, i.coordinates.lat],
                            [options.lon, options.lat]
                        )
                        const diff = Math.abs((i.direction - bearing) % 360)
                        return diff < 40
                    })
                }

                images?.sort((a, b) => {
                    const distanceA = GeoOperations.distanceBetween(
                        [a.coordinates.lng, a.coordinates.lat],
                        [options.lon, options.lat]
                    )
                    const distanceB = GeoOperations.distanceBetween(
                        [b.coordinates.lng, b.coordinates.lat],
                        [options.lon, options.lat]
                    )
                    return distanceA - distanceB
                })

                return { images, beforeFilter: beforeFilterCount }
            },
            [options.blacklist, options.allowSpherical, options.towardscenter, options.shownRadius]
        )
    }

    private update() {
        const seen: Set<string> = new Set<string>(this._options.blacklist.data.map((d) => d.url))
        let beforeFilter = 0
        let result: P4CPicture[] = []
        for (const source of this.individualStores) {
            const imgs = source.data
            if (imgs === undefined) {
                continue
            }
            beforeFilter = beforeFilter + imgs.beforeFilter
            for (const img of imgs.images) {
                if (seen.has(img.pictureUrl)) {
                    continue
                }
                seen.add(img.pictureUrl)
                result.push(img)
            }
        }
        const c = [this._options.lon, this._options.lat]
        result.sort((a, b) => {
            const da = GeoOperations.distanceBetween([a.coordinates.lng, a.coordinates.lat], c)
            const db = GeoOperations.distanceBetween([b.coordinates.lng, b.coordinates.lat], c)
            return da - db
        })
        if (Utils.sameList(result, this._store.data)) {
            //   return
        }
        this._store.setData(result)
    }
}

/**
 * Extracts pictures from currently loaded features
 */
class ImagesInLoadedDataFetcher {
    private indexedFeatures: IndexedFeatureSource

    constructor(indexedFeatures: IndexedFeatureSource) {
        this.indexedFeatures = indexedFeatures
    }

    public fetchAround(loc: { lon: number; lat: number; searchRadius?: number }): P4CPicture[] {
        const foundImages: P4CPicture[] = []
        this.indexedFeatures.features.data.forEach((feature) => {
            const props = feature.properties
            const images = []
            if (props.image) {
                images.push(props.image)
            }
            for (let i = 0; i < 10; i++) {
                if (props["image:" + i]) {
                    images.push(props["image:" + i])
                }
            }
            if (images.length == 0) {
                return
            }
            const centerpoint = GeoOperations.centerpointCoordinates(feature)
            const d = GeoOperations.distanceBetween(centerpoint, [loc.lon, loc.lat])
            if (loc.searchRadius !== undefined && d > loc.searchRadius) {
                return
            }
            for (const image of images) {
                foundImages.push({
                    pictureUrl: image,
                    thumbUrl: image,
                    coordinates: { lng: centerpoint[0], lat: centerpoint[1] },
                    provider: "OpenStreetMap",
                    details: {
                        isSpherical: false,
                    },
                    osmTags: { image },
                })
            }
        })

        return foundImages
    }
}

type P4CService = (typeof NearbyImagesSearch.services)[number]
