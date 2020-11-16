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
        const self = this;

        this.returnToTheMap =
            new Combine([Translations.t.general.returnToTheMap.Clone().SetStyle("font-size:xx-large")])
                .SetStyle("background:var(--catch-detail-color);" +
                    "position: fixed;" +
                    "z-index: 10000;" +
                    "bottom: 0;" +
                    "left: 0;" +
                    `height: var(--return-to-the-map-height);` +
                "width: 100vw;" +
                "color: var(--catch-detail-color-contrast);" +
                "font-weight: bold;" +
                "pointer-events: all;" +
                "cursor: pointer;" +
                "padding-top: 1.2em;" +
                "text-align: center;" +
                "padding-bottom: 1.2em;" +
                "box-sizing:border-box")
            .onClick(() => {
                State.state.fullScreenMessage.setData(undefined);
                onClear();
            });

    }


    InnerRender(): string {
        if (State.state.fullScreenMessage.data === undefined) {
            return "";
        }
        this._content = State.state.fullScreenMessage.data;
        const uielement = new Combine([this._content]).SetStyle(
            "display:block;" +
            "padding: 1em;" +
            "padding-bottom:6em;" +
            `margin-bottom: var(--return-to-the-map-height);` +
            "box-sizing:border-box;" +
            `height:calc(100vh - var(--return-to-the-map-height));` +
            "overflow-y: auto;" +
            "max-width:100vw;" +
            "overflow-x:hidden;" +
            "background:var(--background-color);" +
            "color: var(--foreground-color);"
        );
        return new Combine([uielement, this.returnToTheMap])
            .Render();
    }


}