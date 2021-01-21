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
        return new Combine([this._content])
            .SetClass("block max-h-screen h-screen overflow-x-hidden overflow-y-auto bg-white p-0").Render();
    }

    protected InnerUpdate(htmlElement: HTMLElement) {
        super.InnerUpdate(htmlElement);
    }


}