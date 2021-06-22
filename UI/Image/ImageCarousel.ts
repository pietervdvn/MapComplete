import {SlideShow} from "./SlideShow";
import {UIEventSource} from "../../Logic/UIEventSource";
import Combine from "../Base/Combine";
import DeleteImage from "./DeleteImage";
import {AttributedImage} from "./AttributedImage";
import BaseUIElement from "../BaseUIElement";
import Img from "../Base/Img";
import Toggle from "../Input/Toggle";
import {Wikimedia} from "../../Logic/ImageProviders/Wikimedia";
import {Imgur} from "../../Logic/ImageProviders/Imgur";
import {Mapillary} from "../../Logic/ImageProviders/Mapillary";

export class ImageCarousel extends Toggle {

    constructor(images: UIEventSource<{ key: string, url: string }[]>, tags: UIEventSource<any>) {
        const uiElements = images.map((imageURLS: { key: string, url: string }[]) => {
            const uiElements: BaseUIElement[] = [];
            for (const url of imageURLS) {
                let image = ImageCarousel.CreateImageElement(url.url)
                if (url.key !== undefined) {
                    image = new Combine([
                        image,
                        new DeleteImage(url.key, tags).SetClass("delete-image-marker absolute top-0 left-0 pl-3")
                    ]).SetClass("relative");
                }
                image
                    .SetClass("w-full block")
                    .SetStyle("min-width: 50px; background: grey;")
                uiElements.push(image);
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

    /***
     * Creates either a 'simpleimage' or a 'wikimediaimage' based on the string
     * @param url
     * @constructor
     */
    private static CreateImageElement(url: string): BaseUIElement {
        // @ts-ignore
        let attrSource : ImageAttributionSource = undefined;
        if (url.startsWith("File:")) {
            attrSource = Wikimedia.singleton
        } else if (url.toLowerCase().startsWith("https://commons.wikimedia.org/wiki/")) {
            attrSource = Wikimedia.singleton;
        } else if (url.toLowerCase().startsWith("https://i.imgur.com/")) {
            attrSource = Imgur.singleton
        } else if (url.toLowerCase().startsWith("https://www.mapillary.com/map/im/")) {
            attrSource = Mapillary.singleton
        } else {
            return new Img(url);
        }
        
        return new AttributedImage(url, attrSource)
        
    }
}