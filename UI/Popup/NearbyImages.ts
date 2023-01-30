import Combine from "../Base/Combine"
import { Store, Stores, UIEventSource } from "../../Logic/UIEventSource"
import { SlideShow } from "../Image/SlideShow"
import { ClickableToggle } from "../Input/Toggle"
import Loading from "../Base/Loading"
import { AttributedImage } from "../Image/AttributedImage"
import AllImageProviders from "../../Logic/ImageProviders/AllImageProviders"
import Svg from "../../Svg"
import BaseUIElement from "../BaseUIElement"
import { InputElement } from "../Input/InputElement"
import { VariableUiElement } from "../Base/VariableUIElement"
import Translations from "../i18n/Translations"
import { Mapillary } from "../../Logic/ImageProviders/Mapillary"
import { SubtleButton } from "../Base/SubtleButton"
import { GeoOperations } from "../../Logic/GeoOperations"
import { ElementStorage } from "../../Logic/ElementStorage"
import Lazy from "../Base/Lazy"
import P4C from "pic4carto"
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

class ImagesInLoadedDataFetcher {
    private allElements: ElementStorage

    constructor(state: { allElements: ElementStorage }) {
        this.allElements = state.allElements
    }

    public fetchAround(loc: { lon: number; lat: number; searchRadius?: number }): P4CPicture[] {
        const foundImages: P4CPicture[] = []
        this.allElements.ContainingFeatures.forEach((feature) => {
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
                })
            }
        })
        const cleaned: P4CPicture[] = []
        const seen = new Set<string>()
        for (const foundImage of foundImages) {
            if (seen.has(foundImage.pictureUrl)) {
                continue
            }
            seen.add(foundImage.pictureUrl)
            cleaned.push(foundImage)
        }
        return cleaned
    }
}

export default class NearbyImages extends Lazy {
    constructor(options: NearbyImageOptions, state?: { allElements: ElementStorage }) {
        super(() => {
            const t = Translations.t.image.nearbyPictures
            const shownImages = options.shownImagesCount ?? new UIEventSource(25)

            const loadedPictures = NearbyImages.buildPictureFetcher(options, state)

            const loadMoreButton = new Combine([
                new SubtleButton(Svg.add_svg(), t.loadMore).onClick(() => {
                    shownImages.setData(shownImages.data + 25)
                }),
            ]).SetClass("flex flex-col justify-center")

            const imageElements = loadedPictures.map(
                (imgs) => {
                    if (imgs === undefined) {
                        return []
                    }
                    const elements = (imgs.images ?? [])
                        .slice(0, shownImages.data)
                        .map((i) => this.prepareElement(i))
                    if (imgs.images !== undefined && elements.length < imgs.images.length) {
                        // We effectively sliced some items, so we can increase the count
                        elements.push(loadMoreButton)
                    }
                    return elements
                },
                [shownImages]
            )

            return new VariableUiElement(
                loadedPictures.map((loaded) => {
                    if (loaded?.images === undefined) {
                        return NearbyImages.NoImagesView(new Loading(t.loading)).SetClass(
                            "animate-pulse"
                        )
                    }
                    const images = loaded.images
                    const beforeFilter = loaded?.beforeFilter
                    if (beforeFilter === 0) {
                        return NearbyImages.NoImagesView(t.nothingFound.SetClass("alert block"))
                    } else if (images.length === 0) {
                        const removeFiltersButton = new SubtleButton(
                            Svg.filter_disable_svg(),
                            t.removeFilters
                        ).onClick(() => {
                            options.shownRadius.setData(options.searchRadius)
                            options.allowSpherical.setData(true)
                            options.towardscenter.setData(false)
                        })

                        return NearbyImages.NoImagesView(
                            t.allFiltered.SetClass("font-bold"),
                            removeFiltersButton
                        )
                    }

                    return new SlideShow(imageElements)
                })
            )
        })
    }

    private static NoImagesView(...elems: BaseUIElement[]) {
        return new Combine(elems)
            .SetClass("flex flex-col justify-center items-center bg-gray-200 mb-2 rounded-lg")
            .SetStyle(
                "height: calc( var(--image-carousel-height) - 0.5rem ) ; max-height: calc( var(--image-carousel-height) - 0.5rem );"
            )
    }

    private static buildPictureFetcher(
        options: NearbyImageOptions,
        state?: { allElements: ElementStorage }
    ) {
        const picManager = new P4C.PicturesManager({})
        const searchRadius = options.searchRadius ?? 500

        const nearbyImages =
            state !== undefined ? new ImagesInLoadedDataFetcher(state).fetchAround(options) : []

        return Stores.FromPromise<P4CPicture[]>(
            picManager.startPicsRetrievalAround(
                new P4C.LatLng(options.lat, options.lon),
                options.searchRadius ?? 500,
                {
                    mindate:
                        new Date().getTime() -
                        (options.maxDaysOld ?? 3 * 365) * 24 * 60 * 60 * 1000,
                    towardscenter: false,
                }
            )
        ).map(
            (images) => {
                if (images === undefined) {
                    return undefined
                }
                images = (images ?? []).concat(nearbyImages)
                const blacklisted = options.blacklist?.data
                images = images?.filter(
                    (i) =>
                        !blacklisted?.some((notAllowed) =>
                            Mapillary.sameUrl(i.pictureUrl, notAllowed.url)
                        )
                )

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

    protected prepareElement(info: P4CPicture): BaseUIElement {
        const provider = AllImageProviders.byName(info.provider)
        return new AttributedImage({ url: info.pictureUrl, provider })
    }

    private static asAttributedImage(info: P4CPicture): AttributedImage {
        const provider = AllImageProviders.byName(info.provider)
        return new AttributedImage({ url: info.thumbUrl, provider, date: new Date(info.date) })
    }

    protected asToggle(info: P4CPicture): ClickableToggle {
        const imgNonSelected = NearbyImages.asAttributedImage(info)
        const imageSelected = NearbyImages.asAttributedImage(info)

        const nonSelected = new Combine([imgNonSelected]).SetClass("relative block")
        const hoveringCheckmark = new Combine([
            Svg.confirm_svg().SetClass("block w-24 h-24 -ml-12 -mt-12"),
        ]).SetClass("absolute left-1/2 top-1/2 w-0")
        const selected = new Combine([imageSelected, hoveringCheckmark]).SetClass("relative block")

        return new ClickableToggle(selected, nonSelected).SetClass("").ToggleOnClick()
    }
}

export class SelectOneNearbyImage extends NearbyImages implements InputElement<P4CPicture> {
    private readonly value: UIEventSource<P4CPicture>

    constructor(
        options: NearbyImageOptions & { value?: UIEventSource<P4CPicture> },
        state?: { allElements: ElementStorage }
    ) {
        super(options, state)
        this.value = options.value ?? new UIEventSource<P4CPicture>(undefined)
    }

    GetValue(): UIEventSource<P4CPicture> {
        return this.value
    }

    IsValid(t: P4CPicture): boolean {
        return false
    }

    protected prepareElement(info: P4CPicture): BaseUIElement {
        const toggle = super.asToggle(info)
        toggle.isEnabled.addCallback((enabled) => {
            if (enabled) {
                this.value.setData(info)
            } else if (this.value.data === info) {
                this.value.setData(undefined)
            }
        })

        this.value.addCallback((inf) => {
            if (inf !== info) {
                toggle.isEnabled.setData(false)
            }
        })

        return toggle
    }
}
