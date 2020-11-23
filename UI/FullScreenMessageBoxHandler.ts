import {UIElement} from "./UIElement";
import Translations from "./i18n/Translations";
import State from "../State";
import Combine from "./Base/Combine";

/**
 * Handles the full screen popup on mobile
 */
export class FullScreenMessageBox extends UIElement {

    private readonly returnToTheMap: UIElement;
    private _content: UIElement;

    constructor(onClear: (() => void)) {
        super(State.state.fullScreenMessage);
        this.HideOnEmpty(true);

        this.returnToTheMap =
            new Combine([
                // Wrapped another time to prevent the value of 'em' to fluctuate
                Translations.t.general.returnToTheMap.Clone()
            ])
                .onClick(() => {
                    State.state.fullScreenMessage.setData(undefined);
                    onClear();
                })
                .SetClass("to-the-map")

    }


    InnerRender(): string {
        if (State.state.fullScreenMessage.data === undefined) {
            return "";
        }
        this._content = State.state.fullScreenMessage.data;
        const innerWrap = new Combine([this._content]).SetClass("fullscreenmessage-content")

        return new Combine([innerWrap, this.returnToTheMap])
            .SetStyle("display:block; height: 100%;")
            .Render();
    }

    protected InnerUpdate(htmlElement: HTMLElement) {
        super.InnerUpdate(htmlElement);
        const height = htmlElement.getElementsByClassName("featureinfobox-titlebar")[0]?.clientHeight ?? 0;
        htmlElement.style.setProperty("--variable-title-height", height+"px")
    }


}