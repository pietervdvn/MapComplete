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
var LayerDefinition_1 = require("../LayerDefinition");
var TagsFilter_1 = require("../../Logic/TagsFilter");
var OperatorTag_1 = require("../Questions/OperatorTag");
var L = require("leaflet");
var FixedText_1 = require("../Questions/FixedText");
var ParkingType_1 = require("../Questions/bike/ParkingType");
var ImageCarouselWithUpload_1 = require("../../UI/Image/ImageCarouselWithUpload");
var BikeParkings = /** @class */ (function (_super) {
    __extends(BikeParkings, _super);
    function BikeParkings() {
        var _this = _super.call(this) || this;
        _this.name = "bike_parking";
        _this.icon = "./assets/bike/parking.svg";
        _this.overpassFilter = new TagsFilter_1.Tag("amenity", "bicycle_parking");
        _this.newElementTags = [
            new TagsFilter_1.Tag("amenity", "bicycle_parking"),
        ];
        _this.maxAllowedOverlapPercentage = 10;
        _this.minzoom = 13;
        _this.style = _this.generateStyleFunction();
        _this.title = new FixedText_1.default("Fietsparking");
        _this.elementsToShow = [
            new ImageCarouselWithUpload_1.ImageCarouselWithUploadConstructor(),
            new OperatorTag_1.OperatorTag(),
            new ParkingType_1.default()
        ];
        return _this;
    }
    BikeParkings.prototype.generateStyleFunction = function () {
        var self = this;
        return function (properties) {
            return {
                color: "#00bb00",
                icon: L.icon({
                    iconUrl: self.icon,
                    iconSize: [50, 50]
                })
            };
        };
    };
    return BikeParkings;
}(LayerDefinition_1.LayerDefinition));
exports.default = BikeParkings;
