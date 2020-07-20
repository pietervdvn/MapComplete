"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrayClickHandler = void 0;
var leaflet_1 = require("leaflet");
/**
 * The stray-click-hanlders adds a marker to the map if no feature was clicked.
 * Shows the given uiToShow-element in the messagebox
 */
var StrayClickHandler = /** @class */ (function () {
    function StrayClickHandler(basemap, selectElement, leftMessage, uiToShow) {
        var _this = this;
        this._basemap = basemap;
        this._leftMessage = leftMessage;
        this._uiToShow = uiToShow;
        var self = this;
        var map = basemap.map;
        basemap.LastClickLocation.addCallback(function (lastClick) {
            selectElement.setData(undefined);
            if (self._lastMarker !== undefined) {
                map.removeLayer(self._lastMarker);
            }
            self._lastMarker = leaflet_1.default.marker([lastClick.lat, lastClick.lon]);
            var uiElement = uiToShow();
            var popup = leaflet_1.default.popup().setContent(uiElement.Render());
            uiElement.Activate();
            uiElement.Update();
            self._lastMarker.addTo(map);
            self._lastMarker.bindPopup(popup).openPopup();
            self._lastMarker.on("click", function () {
                leftMessage.setData(self._uiToShow);
            });
        });
        selectElement.addCallback(function () {
            if (self._lastMarker !== undefined) {
                map.removeLayer(self._lastMarker);
                _this._lastMarker = undefined;
            }
        });
    }
    return StrayClickHandler;
}());
exports.StrayClickHandler = StrayClickHandler;
