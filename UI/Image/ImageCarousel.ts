import {UIElement} from "../UIElement";
import {ImageSearcher} from "../../Logic/Actors/ImageSearcher";
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

    constructor(tags: UIEventSource<any>, imagePrefix: string = "image", loadSpecial: boolean =true) {
        super(tags);
        const searcher : UIEventSource<{url:string}[]> = new ImageSearcher(tags, imagePrefix, loadSpecial).images;
        const uiElements = searcher.map((imageURLS: {key: string, url:string}[]) => {
            const uiElements: UIElement[] = [];
            for (const url of imageURLS) {
                let image = ImageCarousel.CreateImageElement(url.url);
                if(url.key !== undefined){
                    image = new Combine([
                        image,
                        new DeleteImage(url.key, tags)
                    ]);
                }
                uiElements.push(image);
            }
            return uiElements;
        });

        this.slideshow = new SlideShow(uiElements).HideOnEmpty(true);
        
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