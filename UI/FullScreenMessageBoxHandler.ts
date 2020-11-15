import {UIElement} from "./UIElement";
import Translations from "./i18n/Translations";
import State from "../State";
import Combine from "./Base/Combine";

/**
 * Handles the full screen popup on mobile
 */
export class FullScreenMessageBox extends UIElement {

    private static readonly _toTheMap_height : string = "5em";
    
    private readonly returnToTheMap: UIElement;
    private _content: UIElement;

    constructor(onClear: (() => void)) {
        super();
        this.HideOnEmpty(true);
        const self = this;
        State.state.fullScreenMessage.addCallbackAndRun(uiElement => {
            self.Update();
            if (uiElement === undefined) {
                location.hash = "";
            } else {
                // The 'hash' makes sure a new piece of history is added. This makes the 'back-button' on android remove the popup
                location.hash = "#element";
            }
        });

        if (window !== undefined) {
            window.onhashchange = function () {
                if (location.hash === "") {
                    // No more element: back to the map!
                    State.state.fullScreenMessage.setData(undefined);
                    onClear();
                }
            }
        }

        this.returnToTheMap =
            new Combine([Translations.t.general.returnToTheMap.Clone().SetStyle("font-size:xx-large")])
                .SetStyle("background:var(--catch-detail-color);" +
                    "position: fixed;" +
                    "z-index: 10000;" +
                    "bottom: 0;" +
                    "left: 0;" +
                    `height: ${FullScreenMessageBox._toTheMap_height};` +
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
                console.log("Returning...")
                State.state.fullScreenMessage.setData(undefined);
                onClear();
                self.Update();
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
            `margin-bottom:${FullScreenMessageBox._toTheMap_height};` +
            "box-sizing:border-box;" +
            `height:calc(100vh - ${FullScreenMessageBox._toTheMap_height});` +
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