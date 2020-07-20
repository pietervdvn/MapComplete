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
exports.DrinkingWater = void 0;
var LayerDefinition_1 = require("../LayerDefinition");
var TagsFilter_1 = require("../../Logic/TagsFilter");
var OperatorTag_1 = require("../Questions/OperatorTag");
var L = require("leaflet");
var FixedText_1 = require("../Questions/FixedText");
var TagRendering_1 = require("../TagRendering");
var ImageCarouselWithUpload_1 = require("../../UI/Image/ImageCarouselWithUpload");
var DrinkingWater = /** @class */ (function (_super) {
    __extends(DrinkingWater, _super);
    function DrinkingWater() {
        var _this = _super.call(this) || this;
        _this.name = "drinking_water";
        _this.icon = "./assets/bug.svg";
        _this.overpassFilter = new TagsFilter_1.Or([
            new TagsFilter_1.And([
                new TagsFilter_1.Tag("amenity", "drinking_water")
            ])
        ]);
        _this.newElementTags = [
            new TagsFilter_1.Tag("amenity", "drinking_water"),
        ];
        _this.maxAllowedOverlapPercentage = 10;
        _this.minzoom = 13;
        _this.style = _this.generateStyleFunction();
        _this.title = new FixedText_1.default("Drinking water");
        _this.elementsToShow = [
            new OperatorTag_1.OperatorTag(),
        ];
        _this.elementsToShow = [
            new ImageCarouselWithUpload_1.ImageCarouselWithUploadConstructor(),
            new TagRendering_1.TagRenderingOptions({
                question: "How easy is it to fill water bottles?",
                mappings: [
                    { k: new TagsFilter_1.Tag("bottle", "yes"), txt: "It is easy to refill water bottles" },
                    { k: new TagsFilter_1.Tag("bottle", "no"), txt: "Water bottles may not fit" }
                ],
            })
        ];
        return _this;
    }
    DrinkingWater.prototype.generateStyleFunction = function () {
        var self = this;
        return function (properties) {
            return {
                color: "#00bb00",
                icon: new L.icon({
                    iconUrl: self.icon,
                    iconSize: [40, 40]
                })
            };
        };
    };
    return DrinkingWater;
}(LayerDefinition_1.LayerDefinition));
exports.DrinkingWater = DrinkingWater;
