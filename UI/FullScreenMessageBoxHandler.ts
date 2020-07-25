import {UIEventSource} from "./UIEventSource";
import {UIElement} from "./UIElement";
import {VariableUiElement} from "./Base/VariableUIElement";
import Translations from "./i18n/Translations";

/**
 * Handles the full screen popup on mobile
 */
export class FullScreenMessageBoxHandler {
    
    private _uielement: UIEventSource<UIElement>;

    constructor(uielement: UIEventSource<UIElement>,
                onClear: (() => void)) {
        this._uielement = uielement;
        this.listenTo(uielement);
        this.update();

        if (window !== undefined) {
            window.onhashchange = function () {
                if (location.hash === "") {
                    // No more element: back to the map!
                    uielement.setData(undefined);
                    onClear();
                }
            }
        }

        Translations.t.general.returnToTheMap
            .onClick(() => {
                uielement.setData(undefined);
                onClear();
            })
            .AttachTo("to-the-map");


    }

    listenTo(uiEventSource: UIEventSource<any>) {
        const self = this;
        uiEventSource.addCallback(function () {
            self.update();
        })
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