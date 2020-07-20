"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Overpass = void 0;
var OsmToGeoJson = require("osmtogeojson");
var $ = require("jquery");
/**
 * Interfaces overpass to get all the latest data
 */
var Overpass = /** @class */ (function () {
    function Overpass(filter) {
        this._filter = filter;
    }
    Overpass.prototype.buildQuery = function (bbox) {
        var filters = this._filter.asOverpass();
        var filter = "";
        for (var _i = 0, filters_1 = filters; _i < filters_1.length; _i++) {
            var filterOr = filters_1[_i];
            filter += 'nwr' + filterOr + ';';
        }
        var query = '[out:json][timeout:25]' + bbox + ';(' + filter + ');out body;>;out skel qt;';
        console.log(query);
        return "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);
    };
    Overpass.prototype.queryGeoJson = function (bbox, continuation, onFail) {
        var query = this.buildQuery(bbox);
        if (Overpass.testUrl !== null) {
            console.log("Using testing URL");
            query = Overpass.testUrl;
        }
        $.getJSON(query, function (json, status) {
            if (status !== "success") {
                console.log("Query failed");
                onFail(status);
            }
            if (json.elements === [] && json.remarks.indexOf("runtime error") > 0) {
                console.log("Timeout or other runtime error");
                return;
            }
            // @ts-ignore
            var geojson = OsmToGeoJson.default(json);
            continuation(geojson);
        }).fail(onFail);
    };
    Overpass.testUrl = null;
    return Overpass;
}());
exports.Overpass = Overpass;
