import {SlideShow} from "./SlideShow";
import {UIEventSource} from "../../Logic/UIEventSource";
import Combine from "../Base/Combine";
import DeleteImage from "./DeleteImage";
import {AttributedImage} from "./AttributedImage";
import BaseUIElement from "../BaseUIElement";
import Toggle from "../Input/Toggle";
import ImageProvider from "../../Logic/ImageProviders/ImageProvider";
import {OsmConnection} from "../../Logic/Osm/OsmConnection";
import {Changes} from "../../Logic/Osm/Changes";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";

export class ImageCarousel extends Toggle {

    constructor(images: UIEventSource<{ key: string, url: string, provider: ImageProvider }[]>,
                tags: UIEventSource<any>,
                state: { osmConnection?: OsmConnection, changes?: Changes, layoutToUse: LayoutConfig }) {
        const uiElements = images.map((imageURLS: { key: string, url: string, provider: ImageProvider }[]) => {
            const uiElements: BaseUIElement[] = [];
            for (const url of imageURLS) {
                try {
                    let image = new AttributedImage(url)

                    if (url.key !== undefined) {
                        image = new Combine([
                            image,
                            new DeleteImage(url.key, tags, state).SetClass("delete-image-marker absolute top-0 left-0 pl-3")
                        ]).SetClass("relative");
                    }
                    image
                        .SetClass("w-full block")
                        .SetStyle("min-width: 50px; background: grey;")
                    uiElements.push(image);
                } catch (e) {
                    console.error("Could not generate image element for", url.url, "due to", e)
                }


            }
            return uiElements;
        });

        super(
            new SlideShow(uiElements).SetClass("w-full"),
            undefined,
            uiElements.map(els => els.length > 0)
        )
        this.SetClass("block w-full");
    }
}