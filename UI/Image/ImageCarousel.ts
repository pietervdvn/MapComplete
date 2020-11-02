import {UIElement} from "../UIElement";
import {ImageSearcher} from "../../Logic/ImageSearcher";
import {SlideShow} from "./SlideShow";
import {UIEventSource} from "../../Logic/UIEventSource";
import Combine from "../Base/Combine";
import DeleteImage from "./DeleteImage";


export class ImageCarousel extends UIElement{

    public readonly slideshow: SlideShow;

    constructor(tags: UIEventSource<any>, imagePrefix: string = "image", loadSpecial: boolean =true) {
        super(tags);
        const searcher : UIEventSource<{url:string}[]> = new ImageSearcher(tags, imagePrefix, loadSpecial);
        const uiElements = searcher.map((imageURLS: {key: string, url:string}[]) => {
            const uiElements: UIElement[] = [];
            for (const url of imageURLS) {
                let image = ImageSearcher.CreateImageElement(url.url);
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
    
    InnerRender(): string {
        return this.slideshow.Render();
    }
}