"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBoxHandler = void 0;
/**
 * Keeps 'messagebox' and 'messageboxmobile' in sync, shows a 'close' button on the latter one
 */
var UIEventSource_1 = require("./UIEventSource");
var VariableUIElement_1 = require("./Base/VariableUIElement");
var MessageBoxHandler = /** @class */ (function () {
    function MessageBoxHandler(uielement, onClear) {
        this._uielement = uielement;
        this.listenTo(uielement);
        this.update();
        window.onhashchange = function () {
            if (location.hash === "") {
                // No more element: back to the map!
                uielement.setData(undefined);
                onClear();
            }
        };
        new VariableUIElement_1.VariableUiElement(new UIEventSource_1.UIEventSource("<h2>Naar de kaart</h2>"), function () {
            document.getElementById("to-the-map").onclick = function () {
                uielement.setData(undefined);
                onClear();
            };
        }).AttachTo("to-the-map");
    }
    MessageBoxHandler.prototype.listenTo = function (uiEventSource) {
        var self = this;
        uiEventSource.addCallback(function () {
            self.update();
        });
    };
    MessageBoxHandler.prototype.update = function () {
        var _a, _b, _c;
        var wrapper = document.getElementById("messagesboxmobilewrapper");
        var gen = this._uielement.data;
        console.log("Generator: ", gen);
        if (gen === undefined) {
            wrapper.classList.add("hidden");
            if (location.hash !== "") {
                location.hash = "";
            }
            return;
        }
        location.hash = "#element";
        wrapper.classList.remove("hidden");
        /*  gen()
              ?.HideOnEmpty(true)
              ?.AttachTo("messagesbox")
              ?.Activate();*/
        (_c = (_b = (_a = gen()) === null || _a === void 0 ? void 0 : _a.HideOnEmpty(true)) === null || _b === void 0 ? void 0 : _b.AttachTo("messagesboxmobile")) === null || _c === void 0 ? void 0 : _c.Activate();
    };
    return MessageBoxHandler;
}());
exports.MessageBoxHandler = MessageBoxHandler;
