import {UIElement} from "../UIElement";
import {ImageSearcher} from "../../Logic/ImageSearcher";
import {UIEventSource} from "../UIEventSource";
import {SlideShow} from "../SlideShow";
import {FixedUiElement} from "../Base/FixedUiElement";
import {VerticalCombine} from "../Base/VerticalCombine";
import {Changes} from "../../Logic/Changes";
import {VariableUiElement} from "../Base/VariableUIElement";

export class ImageCarousel extends UIElement {
    /**
     * There are multiple way to fetch images for an object
     * 1) There is an image tag
     * 2) There is an image tag, the image tag contains multiple ';'-seperated URLS
     * 3) there are multiple image tags, e.g. 'image', 'image:0', 'image:1', and 'image_0', 'image_1' - however, these are pretty rare so we are gonna ignore them
     * 4) There is a wikimedia_commons-tag, which either has a 'File': or a 'category:' containing images
     * 5) There is a wikidata-tag, and the wikidata item either has an 'image' attribute or has 'a link to a wikimedia commons category'
     * 6) There is a wikipedia article, from which we can deduct the wikidata item
     *
     * For some images, author and license should be shown
     */
    private readonly searcher: ImageSearcher;

    public readonly slideshow: SlideShow;

    private readonly _uiElements: UIEventSource<UIElement[]>;

    private readonly _deleteButtonText = new UIEventSource<string>("");
    private readonly _deleteButton: UIElement;

    constructor(tags: UIEventSource<any>, changes: Changes) {
        super(tags);

        const self = this;
        this.searcher = new ImageSearcher(tags, changes);

        this._uiElements = this.searcher.map((imageURLS: string[]) => {
            const uiElements: UIElement[] = [];
            for (const url of imageURLS) {
                const image = ImageSearcher.CreateImageElement(url);
                uiElements.push(image);
            }
            return uiElements;
        });

        this.slideshow = new SlideShow(
            this._uiElements,
            new FixedUiElement("")).HideOnEmpty(true);


        this._deleteButtonText = this.slideshow._currentSlide.map((i) => {
            if(self.searcher.IsDeletable(self.searcher.data[i])){
                return "DELETE";
            }else{
                return "";
            }
        });

        this._deleteButton = new VariableUiElement(this._deleteButtonText)
            .HideOnEmpty(true)
            .onClick(() => {
                self.searcher.Delete(self.searcher.data[self.slideshow._currentSlide.data]);
            });
    }

    InnerRender(): string {
        return this.slideshow.Render() ;
            // + this._deleteButton.Render();
    }

    InnerUpdate(htmlElement: HTMLElement) {
        super.InnerUpdate(htmlElement);
        this._deleteButton.Update();
    }


    Activate() {
        super.Activate();
        this.searcher.Activate();
    }

}