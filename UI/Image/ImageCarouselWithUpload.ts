import {TagDependantUIElement, TagDependantUIElementConstructor} from "../../Customizations/UIElementConstructor";
import {ImageCarousel} from "./ImageCarousel";
import {UIEventSource} from "../UIEventSource";
import {ImageUploadFlow} from "../ImageUploadFlow";
import {Changes} from "../../Logic/Osm/Changes";
import {OsmImageUploadHandler} from "../../Logic/Osm/OsmImageUploadHandler";

export class ImageCarouselWithUploadConstructor implements TagDependantUIElementConstructor{
    IsKnown(properties: any): boolean {
        return true;
    }

    IsQuestioning(properties: any): boolean {
        return false;
    }

    Priority(): number {
        return 0;
    }

    construct(dependencies): TagDependantUIElement {
        return new ImageCarouselWithUpload(dependencies);
    }
}

class ImageCarouselWithUpload extends TagDependantUIElement {
    private _imageElement: ImageCarousel;
    private _pictureUploader: ImageUploadFlow;

    constructor(dependencies: {tags: UIEventSource<any>, changes: Changes}) {
        super(dependencies.tags);
        const tags = dependencies.tags;
        const changes = dependencies.changes;
        this._imageElement = new ImageCarousel(tags, changes);
        const userDetails = changes.login.userDetails;
        const license = changes.login.GetPreference( "pictures-license");
        this._pictureUploader = new OsmImageUploadHandler(tags,
            userDetails, license,
            changes, this._imageElement.slideshow).getUI();

    }

    InnerRender(): string {
        return this._imageElement.Render() +
            this._pictureUploader.Render();
    }

    Activate() {
        super.Activate();
        this._imageElement.Activate();
        this._pictureUploader.Activate();
    }

    Update() {
        super.Update();
        this._imageElement.Update();
        this._pictureUploader.Update();
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