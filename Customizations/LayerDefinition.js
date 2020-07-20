"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayerDefinition = void 0;
var FilteredLayer_1 = require("../Logic/FilteredLayer");
var LayerDefinition = /** @class */ (function () {
    function LayerDefinition(options) {
        if (options === void 0) { options = undefined; }
        var _a;
        /**
         * If an object of the next layer is contained for this many percent in this feature, it is eaten and not shown
         */
        this.maxAllowedOverlapPercentage = undefined;
        if (options === undefined) {
            console.log("No options!");
            return;
        }
        this.name = options.name;
        this.maxAllowedOverlapPercentage = (_a = options.maxAllowedOverlapPercentage) !== null && _a !== void 0 ? _a : 0;
        this.newElementTags = options.newElementTags;
        this.icon = options.icon;
        this.minzoom = options.minzoom;
        this.overpassFilter = options.overpassFilter;
        this.title = options.title;
        this.elementsToShow = options.elementsToShow;
        this.style = options.style;
        console.log(this);
    }
    LayerDefinition.prototype.asLayer = function (basemap, allElements, changes, userDetails, selectedElement, showOnPopup) {
        return new FilteredLayer_1.FilteredLayer(this.name, basemap, allElements, changes, this.overpassFilter, this.maxAllowedOverlapPercentage, this.style, selectedElement, showOnPopup);
    };
    return LayerDefinition;
}());
exports.LayerDefinition = LayerDefinition;
