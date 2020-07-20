"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayerUpdater = void 0;
var Overpass_1 = require("./Overpass");
var TagsFilter_1 = require("./TagsFilter");
var UIEventSource_1 = require("../UI/UIEventSource");
var LayerUpdater = /** @class */ (function () {
    /**
     * The most important layer should go first, as that one gets first pick for the questions
     * @param map
     * @param minzoom
     * @param layers
     */
    function LayerUpdater(map, minzoom, layers) {
        this.runningQuery = new UIEventSource_1.UIEventSource(false);
        this._map = map;
        this._layers = layers;
        this._minzoom = minzoom;
        var filters = [];
        for (var _i = 0, layers_1 = layers; _i < layers_1.length; _i++) {
            var layer = layers_1[_i];
            filters.push(layer.filters);
        }
        this._overpass = new Overpass_1.Overpass(new TagsFilter_1.Or(filters));
        var self = this;
        map.Location.addCallback(function () {
            self.update();
        });
    }
    LayerUpdater.prototype.handleData = function (geojson) {
        this.runningQuery.setData(false);
        for (var _i = 0, _a = this._layers; _i < _a.length; _i++) {
            var layer = _a[_i];
            geojson = layer.SetApplicableData(geojson);
        }
        if (geojson.features.length > 0) {
            console.log("Got some leftovers: ", geojson);
        }
    };
    LayerUpdater.prototype.handleFail = function (reason) {
        console.log("QUERY FAILED", reason);
        console.log("Retrying in 1s");
        this.previousBounds = undefined;
        var self = this;
        window.setTimeout(function () { self.update(); }, 1000);
    };
    LayerUpdater.prototype.update = function () {
        if (this.IsInBounds()) {
            return;
        }
        console.log("Zoom level: ", this._map.map.getZoom(), "Least needed zoom:", this._minzoom);
        if (this._map.map.getZoom() < this._minzoom || this._map.Location.data.zoom < this._minzoom) {
            console.log("Not running query: zoom not sufficient");
            return;
        }
        if (this.runningQuery.data) {
            console.log("Still running a query, skip");
        }
        var bbox = this.buildBboxFor();
        this.runningQuery.setData(true);
        var self = this;
        this._overpass.queryGeoJson(bbox, function (data) {
            self.handleData(data);
        }, function (reason) {
            self.handleFail(reason);
        });
    };
    LayerUpdater.prototype.buildBboxFor = function () {
        var b = this._map.map.getBounds();
        var diff = 0.07;
        var n = b.getNorth() + diff;
        var e = b.getEast() + diff;
        var s = b.getSouth() - diff;
        var w = b.getWest() - diff;
        this.previousBounds = { north: n, east: e, south: s, west: w };
        return "[bbox:" + s + "," + w + "," + n + "," + e + "]";
    };
    LayerUpdater.prototype.IsInBounds = function () {
        if (this.previousBounds === undefined) {
            return false;
        }
        var b = this._map.map.getBounds();
        if (b.getSouth() < this.previousBounds.south) {
            return false;
        }
        if (b.getNorth() > this.previousBounds.north) {
            return false;
        }
        if (b.getEast() > this.previousBounds.east) {
            return false;
        }
        if (b.getWest() < this.previousBounds.west) {
            return false;
        }
        return true;
    };
    return LayerUpdater;
}());
exports.LayerUpdater = LayerUpdater;
