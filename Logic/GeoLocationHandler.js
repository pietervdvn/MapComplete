"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoLocationHandler = void 0;
var UIEventSource_1 = require("../UI/UIEventSource");
var UIElement_1 = require("../UI/UIElement");
var leaflet_1 = require("leaflet");
var Helpers_1 = require("../Helpers");
var GeoLocationHandler = /** @class */ (function (_super) {
    __extends(GeoLocationHandler, _super);
    function GeoLocationHandler(map) {
        var _this = _super.call(this, undefined) || this;
        _this.currentLocation = new UIEventSource_1.UIEventSource(undefined);
        _this._isActive = new UIEventSource_1.UIEventSource(false);
        _this._permission = new UIEventSource_1.UIEventSource("");
        _this._map = map;
        _this.ListenTo(_this.currentLocation);
        _this.ListenTo(_this._isActive);
        _this.ListenTo(_this._permission);
        var self = _this;
        function onAccuratePositionProgress(e) {
            console.log(e.accuracy);
            console.log(e.latlng);
            self.currentLocation.setData({ latlng: e.latlng, accuracy: e.accuracy });
        }
        function onAccuratePositionFound(e) {
            console.log(e.accuracy);
            console.log(e.latlng);
            self.currentLocation.setData({ latlng: e.latlng, accuracy: e.accuracy });
        }
        function onAccuratePositionError(e) {
            console.log("onerror", e.message);
        }
        map.map.on('accuratepositionprogress', onAccuratePositionProgress);
        map.map.on('accuratepositionfound', onAccuratePositionFound);
        map.map.on('accuratepositionerror', onAccuratePositionError);
        var icon = leaflet_1.default.icon({
            iconUrl: './assets/crosshair-blue.svg',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
        });
        _this.currentLocation.addCallback(function (location) {
            var newMarker = leaflet_1.default.marker(location.latlng, { icon: icon });
            newMarker.addTo(map.map);
            if (self._marker !== undefined) {
                map.map.removeLayer(self._marker);
            }
            self._marker = newMarker;
        });
        navigator.permissions.query({ name: 'geolocation' })
            .then(function (status) {
            console.log("Geolocation is already", status);
            if (status.state === "granted") {
                self.StartGeolocating();
            }
            self._permission.setData(status.state);
            status.onchange = function () {
                self._permission.setData(status.state);
            };
        });
        _this.HideOnEmpty(true);
        return _this;
    }
    GeoLocationHandler.prototype.InnerRender = function () {
        if (this.currentLocation.data) {
            return "<img src='./assets/crosshair-blue.svg' alt='locate me'>";
        }
        if (this._isActive.data) {
            return "<img src='./assets/crosshair-blue-center.svg' alt='locate me'>";
        }
        return "<img src='./assets/crosshair.svg' alt='locate me'>";
    };
    GeoLocationHandler.prototype.StartGeolocating = function () {
        var self = this;
        if (self._permission.data === "denied") {
            return "";
        }
        if (self.currentLocation.data !== undefined) {
            self._map.map.flyTo(self.currentLocation.data.latlng, 18);
        }
        console.log("Searching location using GPS");
        self._map.map.findAccuratePosition({
            maxWait: 10000,
            desiredAccuracy: 50 // defaults to 20
        });
        if (!self._isActive.data) {
            self._isActive.setData(true);
            Helpers_1.Helpers.DoEvery(60000, function () {
                self._map.map.findAccuratePosition({
                    maxWait: 10000,
                    desiredAccuracy: 50 // defaults to 20
                });
            });
        }
    };
    GeoLocationHandler.prototype.InnerUpdate = function (htmlElement) {
        _super.prototype.InnerUpdate.call(this, htmlElement);
        var self = this;
        htmlElement.onclick = function () {
            self.StartGeolocating();
        };
    };
    return GeoLocationHandler;
}(UIElement_1.UIElement));
exports.GeoLocationHandler = GeoLocationHandler;
