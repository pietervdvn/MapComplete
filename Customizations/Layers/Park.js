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
exports.Park = void 0;
var LayerDefinition_1 = require("../LayerDefinition");
var TagsFilter_1 = require("../../Logic/TagsFilter");
var TagRendering_1 = require("../TagRendering");
var NameQuestion_1 = require("../Questions/NameQuestion");
var NameInline_1 = require("../Questions/NameInline");
var DescriptionQuestion_1 = require("../Questions/DescriptionQuestion");
var ImageCarouselWithUpload_1 = require("../../UI/Image/ImageCarouselWithUpload");
var Park = /** @class */ (function (_super) {
    __extends(Park, _super);
    function Park() {
        var _this = _super.call(this) || this;
        _this.accessByDefault = new TagRendering_1.TagRenderingOptions({
            question: "Is dit park publiek toegankelijk?",
            mappings: [
                { k: new TagsFilter_1.Tag("access", "yes"), txt: "Publiek toegankelijk" },
                { k: new TagsFilter_1.Tag("access", ""), txt: "Publiek toegankelijk" },
                { k: new TagsFilter_1.Tag("access", "no"), txt: "Niet publiek toegankelijk" },
                { k: new TagsFilter_1.Tag("access", "private"), txt: "Niet publiek toegankelijk, want privaat" },
                { k: new TagsFilter_1.Tag("access", "guided"), txt: "Enkel toegankelijk met een gids of op een activiteit" },
            ],
            freeform: {
                key: "access",
                renderTemplate: "Dit park is niet toegankelijk: {access}",
                template: "De toegankelijkheid van dit park is: $$$"
            },
            priority: 20
        });
        _this.operatorByDefault = new TagRendering_1.TagRenderingOptions({
            question: "Wie beheert dit park?",
            freeform: {
                key: "operator",
                renderTemplate: "Dit park wordt beheerd door {operator}",
                template: "$$$",
            },
            mappings: [{
                    k: null, txt: "De gemeente beheert dit park"
                }],
            priority: 15
        });
        _this.name = "park";
        _this.icon = "./assets/tree_white_background.svg";
        _this.overpassFilter =
            new TagsFilter_1.Or([new TagsFilter_1.Tag("leisure", "park"), new TagsFilter_1.Tag("landuse", "village_green")]);
        _this.newElementTags = [new TagsFilter_1.Tag("leisure", "park"),
            new TagsFilter_1.Tag("fixme", "Toegevoegd met MapComplete, geometry nog uit te tekenen")];
        _this.maxAllowedOverlapPercentage = 25;
        _this.minzoom = 13;
        _this.style = _this.generateStyleFunction();
        _this.title = new NameInline_1.NameInline("park");
        _this.elementsToShow = [
            new ImageCarouselWithUpload_1.ImageCarouselWithUploadConstructor(),
            new NameQuestion_1.NameQuestion(),
            _this.accessByDefault,
            _this.operatorByDefault,
            new DescriptionQuestion_1.DescriptionQuestion("park"),
        ];
        return _this;
    }
    Park.prototype.generateStyleFunction = function () {
        var self = this;
        return function (properties) {
            var _a;
            var questionSeverity = 0;
            for (var _i = 0, _b = self.elementsToShow; _i < _b.length; _i++) {
                var qd = _b[_i];
                if (qd instanceof DescriptionQuestion_1.DescriptionQuestion) {
                    continue;
                }
                if (qd.IsQuestioning(properties)) {
                    questionSeverity = Math.max(questionSeverity, (_a = qd.Priority()) !== null && _a !== void 0 ? _a : 0);
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
    return Park;
}(LayerDefinition_1.LayerDefinition));
exports.Park = Park;
