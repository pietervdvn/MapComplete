import {
    Dependencies,
    TagDependantUIElement,
    TagDependantUIElementConstructor
} from "../../Customizations/UIElementConstructor";
import {ImageCarousel} from "./ImageCarousel";
import {ImageUploadFlow} from "../ImageUploadFlow";
import {OsmImageUploadHandler} from "../../Logic/Osm/OsmImageUploadHandler";
import {State} from "../../State";
import Translation from "../i18n/Translation";

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
        return new Translation({"en":"Image carousel with uploader"});
    }
}

class ImageCarouselWithUpload extends TagDependantUIElement {
    private _imageElement: ImageCarousel;
    private _pictureUploader: ImageUploadFlow;

    constructor(dependencies: Dependencies) {
        super(dependencies.tags);
        const tags = dependencies.tags;
        this._imageElement = new ImageCarousel(tags);
        const license = State.state.osmConnection.GetPreference( "pictures-license");
        this._pictureUploader = new OsmImageUploadHandler(tags, license, this._imageElement.slideshow).getUI();

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