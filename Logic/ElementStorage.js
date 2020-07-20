"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementStorage = void 0;
/**
 * Keeps track of a dictionary 'elementID' -> element
 */
var UIEventSource_1 = require("../UI/UIEventSource");
var ElementStorage = /** @class */ (function () {
    function ElementStorage() {
        this._elements = [];
    }
    ElementStorage.prototype.addElementById = function (id, eventSource) {
        this._elements[id] = eventSource;
    };
    ElementStorage.prototype.addElement = function (element) {
        var eventSource = new UIEventSource_1.UIEventSource(element.properties);
        this._elements[element.properties.id] = eventSource;
        return eventSource;
    };
    ElementStorage.prototype.addOrGetElement = function (element) {
        var elementId = element.properties.id;
        if (elementId in this._elements) {
            var es = this._elements[elementId];
            var keptKeys = es.data;
            // The element already exists
            // We add all the new keys to the old keys
            for (var k in element.properties) {
                var v = element.properties[k];
                if (keptKeys[k] !== v) {
                    keptKeys[k] = v;
                    es.ping();
                }
            }
            return es;
        }
        else {
            return this.addElement(element);
        }
    };
    ElementStorage.prototype.getElement = function (elementId) {
        if (elementId in this._elements) {
            return this._elements[elementId];
        }
        console.log("Can not find eventsource with id ", elementId);
    };
    ElementStorage.prototype.removeId = function (oldId) {
        delete this._elements[oldId];
    };
    return ElementStorage;
}());
exports.ElementStorage = ElementStorage;
