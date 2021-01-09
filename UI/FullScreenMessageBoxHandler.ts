import {UIElement} from "./UIElement";
import State from "../State";
import Combine from "./Base/Combine";

/**
 * Handles the full screen popup on mobile
 */
export default class FullScreenMessageBox extends UIElement {

    private _content: UIElement;

    constructor() {
        super(State.state.fullScreenMessage);
        this.HideOnEmpty(true);
    }


    InnerRender(): string {
        if (State.state.fullScreenMessage.data === undefined) {
            return "";
        }
        this._content = State.state.fullScreenMessage.data.content;
        return new Combine([this._content]).SetClass("fullscreenmessage-content").Render();
    }

    protected InnerUpdate(htmlElement: HTMLElement) {
        super.InnerUpdate(htmlElement);
        // This is a bit out of place, and it is a fix specifically for the featureinfobox-titlebar
        const height = htmlElement.getElementsByClassName("featureinfobox-titlebar")[0]?.clientHeight ?? 0;
        htmlElement.style.setProperty("--variable-title-height", height + "px")
    }


}