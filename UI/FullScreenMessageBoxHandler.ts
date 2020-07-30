import {UIEventSource} from "./UIEventSource";
import {UIElement} from "./UIElement";
import {VariableUiElement} from "./Base/VariableUIElement";
import Translations from "./i18n/Translations";
import {State} from "../State";

/**
 * Handles the full screen popup on mobile
 */
export class FullScreenMessageBoxHandler {

    private _uielement: UIEventSource<UIElement>;

    constructor(onClear: (() => void)) {
        this._uielement = State.state.fullScreenMessage;
        const self = this;
        this._uielement.addCallback(function () {
            self.update();
        });
        
        this.update();

        if (window !== undefined) {
            window.onhashchange = function () {
                if (location.hash === "") {
                    // No more element: back to the map!
                    self._uielement.setData(undefined);
                    onClear();
                }
            }
        }

        Translations.t.general.returnToTheMap
            .onClick(() => {
                self._uielement.setData(undefined);
                onClear();
            })
            .AttachTo("to-the-map");


    }


    update() {
        const wrapper = document.getElementById("messagesboxmobilewrapper");
        const gen = this._uielement.data;
        if (gen === undefined) {
            wrapper.classList.add("hidden")
            if (location.hash !== "") {
                location.hash = ""
            }
            return;
        }
        location.hash = "#element"
        wrapper.classList.remove("hidden");

        gen
            ?.HideOnEmpty(true)
            ?.AttachTo("messagesboxmobile")
            ?.Activate();


    }

}