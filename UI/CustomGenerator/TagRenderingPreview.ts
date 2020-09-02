import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import TagRenderingPanel from "./TagRenderingPanel";

export default class TagRenderingPreview extends UIElement{
    
    constructor(selectedTagRendering: UIEventSource<TagRenderingPanel>) {
        super(selectedTagRendering);
    }
    
    InnerRender(): string {
        return "";
    }
    
}