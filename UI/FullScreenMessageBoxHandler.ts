import {UIElement} from "./UIElement";
import Translations from "./i18n/Translations";
import {State} from "../State";
import Combine from "./Base/Combine";

/**
 * Handles the full screen popup on mobile
 */
export class FullScreenMessageBox extends UIElement {

    private _uielement: UIElement;
    private returnToTheMap: UIElement;

    constructor(onClear: (() => void)) {
        super(undefined);

        const self = this;

        State.state.fullScreenMessage.addCallback(uielement => {
            return self._uielement = uielement?.SetClass("messagesboxmobile-scroll")?.Activate();
        });
        this._uielement = State.state.fullScreenMessage.data;
        this.ListenTo(State.state.fullScreenMessage);
        this.HideOnEmpty(true);

        State.state.fullScreenMessage.addCallback(latestData => {
            if (latestData === undefined) {
                location.hash = "";
            } else {
                location.hash = "#element";
            }
            this.Update();
        })

        if (window !== undefined) {
            window.onhashchange = function () {
                if (location.hash === "") {
                    // No more element: back to the map!
                    self._uielement.setData(undefined);
                    onClear();
                }
            }
        }

        this.returnToTheMap = Translations.t.general.returnToTheMap.Clone()
            .SetClass("to-the-map")
            .onClick(() => {
                console.log("Returning...")
                State.state.fullScreenMessage.setData(undefined);
                onClear();
                self.Update();
            });

    }


    InnerRender(): string {
        if (this._uielement === undefined) {
            return "";
        }
        return new Combine([this._uielement, this.returnToTheMap]).SetStyle("").Render();
    }


}