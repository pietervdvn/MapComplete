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
exports.Bos = void 0;
var LayerDefinition_1 = require("../LayerDefinition");
var TagsFilter_1 = require("../../Logic/TagsFilter");
var AccessTag_1 = require("../Questions/AccessTag");
var OperatorTag_1 = require("../Questions/OperatorTag");
var NameQuestion_1 = require("../Questions/NameQuestion");
var NameInline_1 = require("../Questions/NameInline");
var DescriptionQuestion_1 = require("../Questions/DescriptionQuestion");
var ImageCarouselWithUpload_1 = require("../../UI/Image/ImageCarouselWithUpload");
var Bos = /** @class */ (function (_super) {
    __extends(Bos, _super);
    function Bos() {
        var _this = _super.call(this) || this;
        _this.name = "bos";
        _this.icon = "./assets/tree_white_background.svg";
        _this.overpassFilter = new TagsFilter_1.Or([
            new TagsFilter_1.Tag("natural", "wood"),
            new TagsFilter_1.Tag("landuse", "forest"),
            new TagsFilter_1.Tag("natural", "scrub")
        ]);
        _this.newElementTags = [
            new TagsFilter_1.Tag("landuse", "forest"),
            new TagsFilter_1.Tag("fixme", "Toegevoegd met MapComplete, geometry nog uit te tekenen")
        ];
        _this.maxAllowedOverlapPercentage = 10;
        _this.minzoom = 13;
        _this.style = _this.generateStyleFunction();
        _this.title = new NameInline_1.NameInline("bos");
        _this.elementsToShow = [
            new ImageCarouselWithUpload_1.ImageCarouselWithUploadConstructor(),
            new NameQuestion_1.NameQuestion(),
            new AccessTag_1.AccessTag(),
            new OperatorTag_1.OperatorTag(),
            new DescriptionQuestion_1.DescriptionQuestion("bos")
        ];
        return _this;
    }
    Bos.prototype.generateStyleFunction = function () {
        var self = this;
        return function (properties) {
            var questionSeverity = 0;
            for (var _i = 0, _a = self.elementsToShow; _i < _a.length; _i++) {
                var qd = _a[_i];
                if (qd instanceof DescriptionQuestion_1.DescriptionQuestion) {
                    continue;
                }
                if (qd.IsQuestioning(properties)) {
                    questionSeverity = Math.max(questionSeverity, qd.Priority());
                }
            }
            var colormapping = {
                0: "#00bb00",
                1: "#00ff00",
                10: "#dddd00",
                20: "#ff0000"
            };
            var colour = colormapping[questionSeverity];
            while (colour == undefined) {
                questionSeverity--;
                colour = colormapping[questionSeverity];
            }
            return {
                color: colour,
                icon: undefined
            };
        };
    };
    return Bos;
}(LayerDefinition_1.LayerDefinition));
exports.Bos = Bos;
