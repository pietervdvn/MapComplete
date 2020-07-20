/**
 * Keeps 'messagebox' and 'messageboxmobile' in sync, shows a 'close' button on the latter one
 */
import {UIEventSource} from "./UIEventSource";
import {UIElement} from "./UIElement";
import {VariableUiElement} from "./Base/VariableUIElement";

export class MessageBoxHandler {
    private _uielement: UIEventSource<() => UIElement>;

    constructor(uielement: UIEventSource<() => UIElement>,
                onClear: (() => void)) {
        this._uielement = uielement;
        this.listenTo(uielement);
        this.update();

        window.onhashchange = function () {
            if (location.hash === "") {
                // No more element: back to the map!
                uielement.setData(undefined);
                onClear();
            }
        }

        new VariableUiElement(new UIEventSource<string>("<h2>Naar de kaart</h2>"),
            () => {
                document.getElementById("to-the-map").onclick = function () {
                    uielement.setData(undefined);
                    onClear();
                }
            }
        ).AttachTo("to-the-map");


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

        gen()
            ?.HideOnEmpty(true)
            ?.AttachTo("messagesboxmobile")
            ?.Activate();


    }

}