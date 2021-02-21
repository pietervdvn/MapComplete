import {UIElement} from "../UIElement";
import {SlideShow} from "./SlideShow";
import {UIEventSource} from "../../Logic/UIEventSource";
import Combine from "../Base/Combine";
import DeleteImage from "./DeleteImage";
import {WikimediaImage} from "./WikimediaImage";
import {ImgurImage} from "./ImgurImage";
import {MapillaryImage} from "./MapillaryImage";
import {SimpleImageElement} from "./SimpleImageElement";

export class ImageCarousel extends UIElement{

    public readonly slideshow: UIElement;

    constructor(images: UIEventSource<{key: string, url:string}[]>, tags: UIEventSource<any>) {
        super(images);
        const uiElements = images.map((imageURLS: {key: string, url:string}[]) => {
            const uiElements: UIElement[] = [];
            for (const url of imageURLS) {
                let image = ImageCarousel.CreateImageElement(url.url)
                if(url.key !== undefined){
                    image = new Combine([
                        image,
                        new DeleteImage(url.key, tags).SetClass("delete-image-marker absolute top-0 left-0 pl-3")
                    ]).SetClass("relative");
                }
            image
                .SetClass("w-full block")
                uiElements.push(image);
            }
            return uiElements;
        });

        this.slideshow = new SlideShow(uiElements).HideOnEmpty(true);
        this.SetClass("block w-full");
        this.slideshow.SetClass("w-full");
    }

    /***
     * Creates either a 'simpleimage' or a 'wikimediaimage' based on the string
     * @param url
     * @constructor
     */
    private static CreateImageElement(url: string): UIElement {
        // @ts-ignore
        if (url.startsWith("File:")) {
            return new WikimediaImage(url);
        } else if (url.toLowerCase().startsWith("https://commons.wikimedia.org/wiki/")) {
            const commons = url.substr("https://commons.wikimedia.org/wiki/".length);
            return new WikimediaImage(commons);
        } else if (url.toLowerCase().startsWith("https://i.imgur.com/")) {
            return new ImgurImage(url);
        } else if (url.toLowerCase().startsWith("https://www.mapillary.com/map/im/")) {
            return new MapillaryImage(url);
        } else {
            return new SimpleImageElement(new UIEventSource<string>(url));
        }
    }
    
    InnerRender(): string {
        return this.slideshow.Render();
    }
}