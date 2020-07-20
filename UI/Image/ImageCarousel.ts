import {UIElement} from "../UIElement";
import {ImageSearcher} from "../../Logic/ImageSearcher";
import {UIEventSource} from "../UIEventSource";
import {SlideShow} from "../SlideShow";
import {FixedUiElement} from "../Base/FixedUiElement";
import {VerticalCombine} from "../Base/VerticalCombine";
import {Changes} from "../../Logic/Changes";
import {VariableUiElement} from "../Base/VariableUIElement";
import {ConfirmDialog} from "../ConfirmDialog";
import {UserDetails} from "../../Logic/OsmConnection";
import {TagDependantUIElement, TagDependantUIElementConstructor} from "../../Customizations/UIElementConstructor";

export class ImageCarouselConstructor implements TagDependantUIElementConstructor{
    IsKnown(properties: any): boolean {
        return true;
    }

    IsQuestioning(properties: any): boolean {
        return false;
    }

    Priority(): number {
        return 0;
    }

    construct(dependencies: { tags: UIEventSource<any>, changes: Changes }): TagDependantUIElement {
        return new ImageCarousel(dependencies.tags, dependencies.changes);
    }

}

export class ImageCarousel extends TagDependantUIElement {


    private readonly searcher: ImageSearcher;

    public readonly slideshow: SlideShow;

    private readonly _uiElements: UIEventSource<UIElement[]>;

    private readonly _deleteButton: UIElement;
    private readonly _isDeleted: UIElement;
    
    private readonly _userDetails : UIEventSource<UserDetails>;

    constructor(tags: UIEventSource<any>, changes: Changes) {
        super(tags);
        this._userDetails = changes.login.userDetails;
        
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
            if(!self._userDetails.data.loggedIn){
                return false;
            }
            return self.searcher.IsDeletable(self.searcher.data[i]);
        }, [this.searcher, this._userDetails]);
        this.slideshow._currentSlide.addCallback(() => {
            showDeleteButton.ping(); // This pings the showDeleteButton, which indicates that it has to hide it's subbuttons
        })


        const deleteCurrent = () => {
            self.searcher.Delete(self.searcher.data[self.slideshow._currentSlide.data]);
        }


        this._deleteButton = new ConfirmDialog(showDeleteButton,
            "<img src='assets/delete.svg' alt='Afbeelding verwijderen' class='delete-image'>",
            "<span>Afbeelding verwijderen</span>",
            "<span>Terug</span>",
            deleteCurrent,
            () => {            },
            'delete-image-confirm',
            'delete-image-cancel');


        const mapping = this.slideshow._currentSlide.map((i) => {
            if (this.searcher._deletedImages.data.indexOf(
                this.searcher.data[i]
            ) >= 0) {
                return "<div class='image-is-removed'>Deze afbeelding is verwijderd</div>"
            }

            return "";
        });
        this._isDeleted = new VariableUiElement(
            mapping
        )

        this.searcher._deletedImages.addCallback(() => {
            this.slideshow._currentSlide.ping();
        })

    }

    InnerRender(): string {
        return "<span class='image-carousel-container'>" +
            "<div class='image-delete-container'>" +
            this._deleteButton.Render() +
            this._isDeleted.Render() +
            "</div>" +
            this.slideshow.Render() +
            "</span>";
    }

    IsKnown(): boolean {
        return true;
    }

    IsQuestioning(): boolean {
        return false;
    }

    Priority(): number {
        return 0;
    }

    InnerUpdate(htmlElement: HTMLElement) {
        super.InnerUpdate(htmlElement);
        this._deleteButton.Update();
        this._isDeleted.Update();
    }


    Activate() {
        super.Activate();
        this.searcher.Activate();
    }

}