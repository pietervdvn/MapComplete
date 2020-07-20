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
var L = require("leaflet");
var StationChain_1 = require("../Questions/bike/StationChain");
var StationPumpTools_1 = require("../Questions/bike/StationPumpTools");
var StationStand_1 = require("../Questions/bike/StationStand");
var PumpManual_1 = require("../Questions/bike/PumpManual");
var StationOperator_1 = require("../Questions/bike/StationOperator");
var FixedText_1 = require("../Questions/FixedText");
var PumpManometer_1 = require("../Questions/bike/PumpManometer");
var ImageCarouselWithUpload_1 = require("../../UI/Image/ImageCarouselWithUpload");
var PumpOperational_1 = require("../Questions/bike/PumpOperational");
var PumpValves_1 = require("../Questions/bike/PumpValves");
var BikeStations = /** @class */ (function (_super) {
    __extends(BikeStations, _super);
    function BikeStations() {
        var _this = _super.call(this) || this;
        _this.pump = new TagsFilter_1.Tag("service:bicycle:pump", "yes");
        _this.pumpOperationalAny = new TagsFilter_1.Tag("service:bicycle:pump:operational_status", "yes");
        _this.pumpOperationalOk = new TagsFilter_1.Or([new TagsFilter_1.Tag("service:bicycle:pump:operational_status", "yes"), new TagsFilter_1.Tag("service:bicycle:pump:operational_status", "operational"), new TagsFilter_1.Tag("service:bicycle:pump:operational_status", "ok"), new TagsFilter_1.Tag("service:bicycle:pump:operational_status", "")]);
        _this.tools = new TagsFilter_1.Tag("service:bicycle:tools", "yes");
        _this.name = "bike station or pump";
        _this.icon = "./assets/wrench.svg";
        _this.overpassFilter = new TagsFilter_1.And([
            new TagsFilter_1.Tag("amenity", "bicycle_repair_station")
        ]);
        _this.newElementTags = [
            new TagsFilter_1.Tag("amenity", "bicycle_repair_station")
        ];
        _this.maxAllowedOverlapPercentage = 10;
        _this.minzoom = 13;
        _this.style = _this.generateStyleFunction();
        _this.title = new FixedText_1.default("Bike station");
        _this.elementsToShow = [
            new ImageCarouselWithUpload_1.ImageCarouselWithUploadConstructor(),
            new StationPumpTools_1.default(),
            new StationChain_1.default().OnlyShowIf(_this.tools),
            new StationStand_1.default().OnlyShowIf(_this.tools),
            new PumpManual_1.default().OnlyShowIf(_this.pump),
            new PumpManometer_1.default().OnlyShowIf(_this.pump),
            new PumpValves_1.default().OnlyShowIf(_this.pump),
            new PumpOperational_1.default().OnlyShowIf(_this.pump),
            new StationOperator_1.default(),
        ];
        return _this;
    }
    BikeStations.prototype.generateStyleFunction = function () {
        var self = this;
        return function (properties) {
            var hasPump = self.pump.matchesProperties(properties);
            var isOperational = self.pumpOperationalOk.matchesProperties(properties);
            var hasTools = self.tools.matchesProperties(properties);
            var iconName = "";
            if (hasPump) {
                if (hasTools) {
                    iconName = "repair_station_pump.svg";
                }
                else {
                    if (isOperational) {
                        iconName = "pump.svg";
                    }
                    else {
                        iconName = "pump_broken.svg";
                    }
                }
            }
            else {
                iconName = "repair_station.svg";
            }
            var iconUrl = "./assets/bike/" + iconName;
            return {
                color: "#00bb00",
                icon: L.icon({
                    iconUrl: iconUrl,
                    iconSize: [50, 50]
                })
            };
        };
    };
    return BikeStations;
}(LayerDefinition_1.LayerDefinition));
exports.default = BikeStations;
