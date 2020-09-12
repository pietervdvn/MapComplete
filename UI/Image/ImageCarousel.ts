import {UIElement} from "../UIElement";
import {ImageSearcher} from "../../Logic/ImageSearcher";
import {SlideShow} from "../SlideShow";
import {UIEventSource} from "../../Logic/UIEventSource";
import {
    Dependencies,
    TagDependantUIElement,
    TagDependantUIElementConstructor
} from "../../Customizations/UIElementConstructor";
import Translation from "../i18n/Translation";

export class ImageCarouselConstructor implements TagDependantUIElementConstructor {
    IsKnown(properties: any): boolean {
        return true;
    }

    IsQuestioning(properties: any): boolean {
        return false;
    }

    Priority(): number {
        return 0;
    }

    construct(dependencies: Dependencies): TagDependantUIElement {
        return new ImageCarousel(dependencies.tags);
    }

    GetContent(tags: any): Translation {
        return new Translation({"en":"Images without upload"});
    }

}

export class ImageCarousel extends TagDependantUIElement {

    public readonly searcher: ImageSearcher;
    public readonly slideshow: SlideShow;

    constructor(tags: UIEventSource<any>) {
        super(tags);
        this.searcher = new ImageSearcher(tags);
        const uiElements = this.searcher.map((imageURLS: string[]) => {
            const uiElements: UIElement[] = [];
            for (const url of imageURLS) {
                const image = ImageSearcher.CreateImageElement(url);
                uiElements.push(image);
            }
            return uiElements;
        });

        this.slideshow = new SlideShow(uiElements).HideOnEmpty(true);

    }

    InnerRender(): string {
        return this.slideshow.Render();
    }

    IsKnown(): boolean {
        return true;
    }

    IsQuestioning(): boolean {
        return false;
    }
    
    IsSkipped(): boolean {
        return false;
    }

    Priority(): number {
        return 0;
    }



}