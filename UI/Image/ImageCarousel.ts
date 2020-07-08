import {UIElement} from "../UIElement";
import {ImageSearcher} from "../../Logic/ImageSearcher";
import {UIEventSource} from "../UIEventSource";
import {SlideShow} from "../SlideShow";
import {FixedUiElement} from "../Base/FixedUiElement";
import {VerticalCombine} from "../Base/VerticalCombine";
import {Changes} from "../../Logic/Changes";
import {VariableUiElement} from "../Base/VariableUIElement";
import {ConfirmDialog} from "../ConfirmDialog";

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


        const showDeleteButton = this.slideshow._currentSlide.map((i) => {
            return self.searcher.IsDeletable(self.searcher.data[i]);
        }, [this.searcher]);
        this.slideshow._currentSlide.addCallback(() => {
            showDeleteButton.ping(); // This pings the showDeleteButton, which indicates that it has to hide it's subbuttons
        })


        const deleteCurrent = () => self.searcher.Delete(self.searcher.data[self.slideshow._currentSlide.data]);

        this._deleteButton = new ConfirmDialog(showDeleteButton,
            "<img src='assets/delete.svg' alt='Afbeelding verwijderen' class='delete-image'>",
            "<span>Afbeelding verwijderen</span>",
            "<span>Terug</span>",
            deleteCurrent,
            () => {},
            'delete-image-confirm',
            'delete-image-cancel');
    }

    InnerRender(): string {
        return "<span class='image-carousel-container'>" +
            "<div class='image-delete-container'>" +
            this._deleteButton.Render() +
            "</div>" +
            this.slideshow.Render() +
            "</span>";
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