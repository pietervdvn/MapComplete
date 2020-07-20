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
exports.MetaMap = void 0;
var Layout_1 = require("../Layout");
var Map_1 = require("../Layers/Map");
var MetaMap = /** @class */ (function (_super) {
    __extends(MetaMap, _super);
    function MetaMap() {
        return _super.call(this, "metamap", "Open Map Map", [new Map_1.Map()], 1, 0, 0, "        <h3>Open Map Map</h3>\n" +
            "This map is a map of physical maps, as known by OpenStreetMap.") || this;
    }
    return MetaMap;
}(Layout_1.Layout));
exports.MetaMap = MetaMap;
