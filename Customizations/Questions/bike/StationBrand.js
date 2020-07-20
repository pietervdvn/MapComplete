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
var TagRendering_1 = require("../../TagRendering");
var TagsFilter_1 = require("../../../Logic/TagsFilter");
/**
 * Currently not used in Cyclofix because it's a little vague
 */
var BikeStationBrand = /** @class */ (function (_super) {
    __extends(BikeStationBrand, _super);
    function BikeStationBrand() {
        var _this = this;
        throw Error('BikeStationBrand disabled');
        _this = _super.call(this, BikeStationBrand.options) || this;
        return _this;
    }
    BikeStationBrand.options = {
        priority: 15,
        question: "What is the brand of this bike station (name of university, shop, city...)?",
        freeform: {
            key: "brand",
            template: "The brand of this bike station is $$$",
            renderTemplate: "The brand of this bike station is {operator}",
            placeholder: "brand"
        },
        mappings: [
            { k: new TagsFilter_1.Tag("brand", "Velo Fix Station"), txt: "Velo Fix Station" }
        ]
    };
    return BikeStationBrand;
}(TagRendering_1.TagRenderingOptions));
exports.default = BikeStationBrand;
