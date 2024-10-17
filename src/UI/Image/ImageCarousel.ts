import { SlideShow } from "./SlideShow"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import Combine from "../Base/Combine"
import DeleteImage from "./DeleteImage"
import BaseUIElement from "../BaseUIElement"
import Toggle from "../Input/Toggle"
import ImageProvider, { ProvidedImage } from "../../Logic/ImageProviders/ImageProvider"
import { OsmConnection } from "../../Logic/Osm/OsmConnection"
import { Changes } from "../../Logic/Osm/Changes"
import ThemeConfig from "../../Models/ThemeConfig/ThemeConfig"
import SvelteUIElement from "../Base/SvelteUIElement"
import AttributedImage from "./AttributedImage.svelte"

export class ImageCarousel extends Toggle {
    constructor(
        images: Store<{ id: string; key: string; url: string; provider: ImageProvider }[]>,
        tags: Store<any>,
        state: {
            osmConnection?: OsmConnection
            changes?: Changes
            theme: ThemeConfig
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
                            state,
                            previewedImage: state?.previewedImage,
                        }).SetClass("h-full")

                        if (url.key !== undefined) {
                            image = new Combine([
                                image,
                                new DeleteImage(url.key, tags, state).SetClass(
                                    "delete-image-marker absolute top-0 left-0 pl-3"
                                ),
                            ]).SetClass("relative")
                        }
                        image
                            .SetClass("w-full h-full block cursor-zoom-in low-interaction")
                            .SetStyle("min-width: 50px;")
                        uiElements.push(image)
                    } catch (e) {
                        console.error("Could not generate image element for", url.url, "due to", e)
                    }
                }
                return uiElements
            }
        )

        super(
            new SlideShow(uiElements).SetClass("w-full block w-full my-4"),
            undefined,
            uiElements.map((els) => els.length > 0)
        )
    }
}
