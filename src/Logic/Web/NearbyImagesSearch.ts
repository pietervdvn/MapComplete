import { IndexedFeatureSource } from "../FeatureSource/FeatureSource"
import { GeoOperations } from "../GeoOperations"
import { Store, UIEventSource } from "../UIEventSource"
import P4C from "pic4carto"
import { Tiles } from "../../Models/TileRange"
import { BBox } from "../BBox"
import Constants from "../../Models/Constants"
import { Utils } from "../../Utils"
import { Point } from "geojson"
import MvtSource from "../FeatureSource/Sources/MvtSource"
import AllImageProviders from "../ImageProviders/AllImageProviders"
import { Imgur } from "../ImageProviders/Imgur"
import { Panoramax, PanoramaxXYZ } from "panoramax-js/dist"

interface ImageFetcher {
    /**
     * Returns images, null if an error happened
     * @param lat
     * @param lon
     */
    fetchImages(lat: number, lon: number): Promise<P4CPicture[]>

    readonly name: string
}

class CachedFetcher implements ImageFetcher {
    private readonly _fetcher: ImageFetcher
    private readonly _zoomlevel: number
    private readonly cache: Map<number, Promise<P4CPicture[]>> = new Map<
        number,
        Promise<P4CPicture[]>
    >()
    public readonly name: string

    constructor(fetcher: ImageFetcher, zoomlevel: number = 19) {
        this._fetcher = fetcher
        this._zoomlevel = zoomlevel
        this.name = fetcher.name
    }

    fetchImages(lat: number, lon: number): Promise<P4CPicture[]> {
        const tile = Tiles.embedded_tile(lat, lon, this._zoomlevel)
        const tileIndex = Tiles.tile_index(tile.z, tile.x, tile.y)
        if (this.cache.has(tileIndex)) {
            return this.cache.get(tileIndex)
        }
        const call = this._fetcher.fetchImages(lat, lon)
        this.cache.set(tileIndex, call)
        return call
    }
}

export interface P4CPicture {
    pictureUrl: string
    date?: number
    coordinates: { lat: number; lng: number }
    provider: "Mapillary" | string
    author?
    license?
    detailsUrl?: string
    direction?: number
    osmTags?: object /*To copy straight into OSM!*/
    thumbUrl: string
    details: {
        isSpherical: boolean
    }
}

class NearbyImageUtils {
    /**
     * In place sorting of the given array, by distance. Closest element will be first
     */
    public static sortByDistance(result: P4CPicture[], lon: number, lat: number) {
        const c = [lon, lat]
        result.sort((a, b) => {
            const da = GeoOperations.distanceBetween([a.coordinates.lng, a.coordinates.lat], c)
            const db = GeoOperations.distanceBetween([b.coordinates.lng, b.coordinates.lat], c)
            return da - db
        })
    }
}

class P4CImageFetcher implements ImageFetcher {
    public static readonly services = ["mapillary", "flickr", "kartaview", "wikicommons"] as const
    public static readonly apiUrls = ["https://api.flickr.com"]
    private _options: { maxDaysOld: number; searchRadius: number }
    public readonly name: P4CService

    constructor(service: P4CService, options?: { maxDaysOld: number; searchRadius: number }) {
        this.name = service
        this._options = options
    }

    async fetchImages(lat: number, lon: number): Promise<P4CPicture[]> {
        const picManager = new P4C.PicturesManager({ usefetchers: [this.name] })
        const maxAgeSeconds = (this._options?.maxDaysOld ?? 3 * 365) * 24 * 60 * 60 * 1000
        const searchRadius = this._options?.searchRadius ?? 100

        try {
            return await picManager.startPicsRetrievalAround(
                new P4C.LatLng(lat, lon),
                searchRadius,
                {
                    mindate: new Date().getTime() - maxAgeSeconds,
                    towardscenter: false,
                }
            )
        } catch (e) {
            console.log("P4C image fetcher failed with", e)
            throw e
        }
    }
}

/**
 * Extracts pictures from features which are currently loaded on the local machine, probably features of the same layer
 */
class ImagesInLoadedDataFetcher implements ImageFetcher {
    private indexedFeatures: IndexedFeatureSource
    private readonly _searchRadius: number
    public readonly name = "inLoadedData"

    constructor(indexedFeatures: IndexedFeatureSource, searchRadius: number = 500) {
        this.indexedFeatures = indexedFeatures
        this._searchRadius = searchRadius
    }

    async fetchImages(lat: number, lon: number): Promise<P4CPicture[]> {
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
            const d = GeoOperations.distanceBetween(centerpoint, [lon, lat])
            if (this._searchRadius !== undefined && d > this._searchRadius) {
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

class ImagesFromPanoramaxFetcher implements ImageFetcher {
    private readonly _radius: number
    private readonly _panoramax: Panoramax
    name: string = "panoramax"

    constructor(url?: string, radius: number = 100) {
        this._radius = radius
        if (url) {
            this._panoramax = new Panoramax(url)
        } else {
            this._panoramax = new PanoramaxXYZ()
        }
    }

    public async fetchImages(lat: number, lon: number): Promise<P4CPicture[]> {
        const bboxObj = new BBox([
            GeoOperations.destination([lon, lat], this._radius * Math.sqrt(2), -45),
            GeoOperations.destination([lon, lat], this._radius * Math.sqrt(2), 135),
        ])
        const bbox: [number, number, number, number] = bboxObj.toLngLatFlat()
        const images = await this._panoramax.search({ bbox, limit: 1000 })

        return images.map((i) => {
            const [lng, lat] = i.geometry.coordinates
            return {
                pictureUrl: i.assets.sd.href,
                coordinates: { lng, lat },

                provider: "panoramax",
                direction: i.properties["view:azimuth"],
                osmTags: {
                    panoramax: i.id,
                },
                thumbUrl: i.assets.thumb.href,
                date: new Date(i.properties.datetime).getTime(),
                license: i.properties["geovisio:license"],
                author: i.providers.at(-1).name,
                detailsUrl: i.id,
                details: {
                    isSpherical:
                        i.properties["exif"]["Xmp.GPano.ProjectionType"] === "equirectangular",
                },
            }
        })
    }
}

class ImagesFromCacheServerFetcher implements ImageFetcher {
    private readonly _searchRadius: number
    public readonly name = "fromCacheServer"
    private readonly _serverUrl: string

    constructor(searchRadius: number = 500, serverUrl: string = Constants.VectorTileServer) {
        this._searchRadius = searchRadius
        this._serverUrl = serverUrl
    }

    async fetchImages(lat: number, lon: number): Promise<P4CPicture[]> {
        return (
            await Promise.all([
                this.fetchImagesForType(lat, lon, "lines"),
                this.fetchImagesForType(lat, lon, "pois"),
                this.fetchImagesForType(lat, lon, "polygons"),
            ])
        ).flatMap((x) => x)
    }

    async fetchImagesForType(
        targetlat: number,
        targetlon: number,
        type: "lines" | "pois" | "polygons"
    ): Promise<P4CPicture[]> {
        const { x, y, z } = Tiles.embedded_tile(targetlat, targetlon, 14)

        const url = this._serverUrl

        async function getFeatures(x: number, y: number) {
            const src = new MvtSource(
                Utils.SubstituteKeys(url, {
                    type,
                    x,
                    y,
                    z,
                    layer: "item_with_image",
                }),
                x,
                y,
                z
            )
            await src.updateAsync()
            return src.features.data
        }

        const features = (
            await Promise.all([
                getFeatures(x, y),
                getFeatures(x, y + 1),
                getFeatures(x, y - 1),

                getFeatures(x + 1, y + 1),
                getFeatures(x + 1, y),
                getFeatures(x + 1, y - 1),

                getFeatures(x - 1, y - 1),
                getFeatures(x - 1, y),
                getFeatures(x - 1, y + 1),
            ])
        ).flatMap((x) => x)

        const pics: P4CPicture[] = []
        for (const f of features) {
            const [lng, lat] = GeoOperations.centerpointCoordinates(f)
            if (
                GeoOperations.distanceBetween([targetlon, targetlat], [lng, lat]) >
                this._searchRadius
            ) {
                return []
            }
            for (let i = -1; i < 50; i++) {
                let key = "image"
                if (i >= 0) {
                    key += ":" + i
                }
                const v = f.properties[key]
                console.log(v)
                if (!v) {
                    continue
                }
                let provider = "unkown"
                try {
                    provider = (await AllImageProviders.selectBestProvider("image", v))?.name
                } catch (e) {
                    console.error("Could not detect provider for", "image", v)
                }
                pics.push({
                    pictureUrl: v,
                    coordinates: { lat, lng },
                    details: {
                        isSpherical: false,
                    },
                    osmTags: {
                        image: v,
                    },
                    thumbUrl: v,
                    provider,
                })
            }
        }
        return pics
    }
}

class MapillaryFetcher implements ImageFetcher {
    public readonly name = "mapillary_new"
    private readonly _panoramas: "only" | "no" | undefined
    private readonly _max_images: 100 | number

    private readonly start_captured_at?: Date
    private readonly end_captured_at?: Date

    constructor(options?: {
        panoramas: undefined | "only" | "no"
        max_images?: 100 | number
        start_captured_at?: Date
        end_captured_at?: Date
    }) {
        this._panoramas = options?.panoramas
        this._max_images = options?.max_images ?? 100
        this.start_captured_at = options?.start_captured_at
        this.end_captured_at = options?.end_captured_at
    }

    async fetchImages(lat: number, lon: number): Promise<P4CPicture[]> {
        const boundingBox = new BBox([[lon, lat]]).padAbsolute(0.003)
        let url =
            "https://graph.mapillary.com/images?fields=computed_geometry,creator,id,thumb_256_url,thumb_original_url,compass_angle&bbox=" +
            [
                boundingBox.getWest(),
                boundingBox.getSouth(),
                boundingBox.getEast(),
                boundingBox.getNorth(),
            ].join(",") +
            "&access_token=" +
            encodeURIComponent(Constants.mapillary_client_token_v4) +
            "&limit=" +
            this._max_images
        {
            if (this._panoramas === "no") {
                url += "&is_pano=false"
            } else if (this._panoramas === "only") {
                url += "&is_pano=true"
            }
            if (this.start_captured_at) {
                url += "&start_captured_at=" + this.start_captured_at?.toISOString()
            }
            if (this.end_captured_at) {
                url += "&end_captured_at=" + this.end_captured_at?.toISOString()
            }
        }

        const response = await Utils.downloadJson<{
            data: {
                id: string
                creator: string
                computed_geometry: Point
                is_pano: boolean
                thumb_256_url: string
                thumb_original_url: string
                compass_angle: number
            }[]
        }>(url)
        const pics: P4CPicture[] = []
        for (const img of response.data) {
            const c = img.computed_geometry.coordinates
            if (img.thumb_original_url === undefined) {
                continue
            }
            pics.push({
                pictureUrl: img.thumb_original_url,
                provider: "Mapillary",
                coordinates: { lng: c[0], lat: c[1] },
                thumbUrl: img.thumb_256_url,
                osmTags: {
                    mapillary: img.id,
                },
                details: {
                    isSpherical: img.is_pano,
                },
            })
        }
        return pics
    }
}

type P4CService = (typeof P4CImageFetcher.services)[number]

export class CombinedFetcher {
    private readonly sources: ReadonlyArray<CachedFetcher>
    public static apiUrls = [...P4CImageFetcher.apiUrls, Imgur.apiUrl, ...Imgur.supportingUrls]

    constructor(radius: number, maxage: Date, indexedFeatures: IndexedFeatureSource) {
        this.sources = [
            new ImagesInLoadedDataFetcher(indexedFeatures, radius),
            new ImagesFromCacheServerFetcher(radius),
            new ImagesFromPanoramaxFetcher(),
            new ImagesFromPanoramaxFetcher(Constants.panoramax.url),
            new MapillaryFetcher({
                panoramas: "no",
                max_images: 25,
                start_captured_at: maxage,
            }),
            new P4CImageFetcher("mapillary"),
            new P4CImageFetcher("wikicommons"),
        ].map((f) => new CachedFetcher(f))
    }

    private async fetchImage(
        source: CachedFetcher,
        lat: number,
        lon: number,
        state: UIEventSource<Record<string, "loading" | "done" | "error">>,
        sink: UIEventSource<P4CPicture[]>
    ): Promise<void> {
        try {
            const pics = await source.fetchImages(lat, lon)
            console.log(source.name, "==>>", pics)
            state.data[source.name] = "done"
            state.ping()

            if (sink.data === undefined) {
                sink.setData(pics)
            } else {
                const newList = []
                const seenIds = new Set<string>()
                for (const p4CPicture of [...sink.data, ...pics]) {
                    const id = p4CPicture.pictureUrl
                    if (seenIds.has(id)) {
                        continue
                    }
                    newList.push(p4CPicture)
                    seenIds.add(id)
                }
                NearbyImageUtils.sortByDistance(newList, lon, lat)
                sink.setData(newList)
            }
        } catch (e) {
            console.error("Could not load images from", source.name, "due to", e)
            state.data[source.name] = "error"
            state.ping()
        }
    }

    public getImagesAround(
        lon: number,
        lat: number
    ): {
        images: Store<P4CPicture[]>
        state: Store<Record<string, "loading" | "done" | "error">>
    } {
        const sink = new UIEventSource<P4CPicture[]>([])
        const state = new UIEventSource<Record<string, "loading" | "done" | "error">>({})
        for (const source of this.sources) {
            state.data[source.name] = "loading"
            state.ping()
            this.fetchImage(source, lat, lon, state, sink)
        }
        return { images: sink, state }
    }
}
