import { SlideShow } from "./SlideShow"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import Combine from "../Base/Combine"
import DeleteImage from "./DeleteImage"
import BaseUIElement from "../BaseUIElement"
import Toggle from "../Input/Toggle"
import ImageProvider, { ProvidedImage } from "../../Logic/ImageProviders/ImageProvider"
import { OsmConnection } from "../../Logic/Osm/OsmConnection"
import { Changes } from "../../Logic/Osm/Changes"
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
import { Feature } from "geojson"
import SvelteUIElement from "../Base/SvelteUIElement"
import AttributedImage from "./AttributedImage.svelte"

export class ImageCarousel extends Toggle {
    constructor(
        images: Store<{ id: string; key: string; url: string; provider: ImageProvider }[]>,
        tags: Store<any>,
        state: {
            osmConnection?: OsmConnection
            changes?: Changes
            layout: LayoutConfig
            previewedImage?: UIEventSource<ProvidedImage>
        }
    ) {
        const uiElements = images.map(
            (imageURLS: { key: string; url: string; provider: ImageProvider; id: string }[]) => {
                const uiElements: BaseUIElement[] = []
                for (const url of imageURLS) {
                    try {
                        let image: BaseUIElement = new SvelteUIElement(AttributedImage, {
                            image: url,
                            previewedImage: state?.previewedImage,
                        })

                        if (url.key !== undefined) {
                            image = new Combine([
                                image,
                                new DeleteImage(url.key, tags, state).SetClass(
                                    "delete-image-marker absolute top-0 left-0 pl-3"
                                ),
                            ]).SetClass("relative")
                        }
                        image
                            .SetClass("w-full block cursor-zoom-in")
                            .SetStyle("min-width: 50px; background: grey;")
                        uiElements.push(image)
                    } catch (e) {
                        console.error("Could not generate image element for", url.url, "due to", e)
                    }
                }
                return uiElements
            }
        )

        super(
            new SlideShow(uiElements).SetClass("w-full"),
            undefined,
            uiElements.map((els) => els.length > 0)
        )
        this.SetClass("block w-full")
    }
}
