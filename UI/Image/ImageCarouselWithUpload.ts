import {TagDependantUIElement, TagDependantUIElementConstructor} from "../../Customizations/UIElementConstructor";
import {ImageCarousel} from "./ImageCarousel";
import {ImageUploadFlow} from "./ImageUploadFlow";
import Translation from "../i18n/Translation";
import {UIEventSource} from "../../Logic/UIEventSource";

export default class ImageCarouselWithUploadConstructor implements TagDependantUIElementConstructor{
    
    IsKnown(properties: any): boolean {
        return true;
    }

    IsQuestioning(properties: any): boolean {
        return false;
    }

    construct(dependencies): TagDependantUIElement {
        return new ImageCarouselWithUpload(dependencies);
    }
    
    GetContent(tags: any): Translation {
        return new Translation({"*": "Image carousel with uploader"});
    }
}

class OsmImageUploadHandler {
    constructor(tags: UIEventSource<any>) {
        
    }

}

class ImageCarouselWithUpload extends TagDependantUIElement {
    private _imageElement: ImageCarousel;
    private _pictureUploader: ImageUploadFlow;

    constructor(tags: UIEventSource<any>) {
        super(tags);
        this._imageElement = new ImageCarousel(tags);
        this._pictureUploader = new OsmImageUploadHandler(tags).getUI();

    }

    InnerRender(): string {
        return this._imageElement.Render() +
            this._pictureUploader.Render();
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

}