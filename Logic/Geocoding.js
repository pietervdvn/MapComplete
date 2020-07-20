"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Geocoding = void 0;
var $ = require("jquery");
var Geocoding = /** @class */ (function () {
    function Geocoding() {
    }
    Geocoding.Search = function (query, basemap, handleResult, onFail) {
        var b = basemap.map.getBounds();
        console.log(b);
        $.getJSON(Geocoding.host + "format=json&limit=1&viewbox=" +
            (b.getEast() + "," + b.getNorth() + "," + b.getWest() + "," + b.getSouth()) +
            "&accept-language=nl&q=" + query, function (data) {
            handleResult(data);
        }).fail(function () {
            onFail();
        });
    };
    Geocoding.host = "https://nominatim.openstreetmap.org/search?";
    return Geocoding;
}());
exports.Geocoding = Geocoding;
