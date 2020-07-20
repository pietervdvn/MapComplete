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
exports.GhostBike = void 0;
var LayerDefinition_1 = require("../LayerDefinition");
var TagsFilter_1 = require("../../Logic/TagsFilter");
var TagRendering_1 = require("../TagRendering");
var FixedText_1 = require("../Questions/FixedText");
var ImageCarouselWithUpload_1 = require("../../UI/Image/ImageCarouselWithUpload");
var leaflet_1 = require("leaflet");
var GhostBike = /** @class */ (function (_super) {
    __extends(GhostBike, _super);
    function GhostBike() {
        var _this = _super.call(this) || this;
        _this.name = "ghost bike";
        _this.overpassFilter = new TagsFilter_1.Tag("memorial", "ghost_bike");
        _this.title = new FixedText_1.default("Ghost bike");
        _this.elementsToShow = [
            new FixedText_1.default("A <b>ghost bike</b> is a memorial for a cyclist who died in a traffic accident," +
                " in the form of a white bicycle placed permanently near the accident location."),
            new ImageCarouselWithUpload_1.ImageCarouselWithUploadConstructor(),
            new TagRendering_1.TagRenderingOptions({
                question: "Whom is remembered by this ghost bike?" +
                    "<span class='question-subtext'>" +
                    "<br/>" +
                    "Please respect privacy - only fill out the name if it is widely published or marked on the cycle." +
                    "</span>",
                mappings: [{ k: new TagsFilter_1.Tag("noname", "yes"), txt: "There is no name marked on the bike" },],
                freeform: {
                    key: "name",
                    extraTags: new TagsFilter_1.Tag("noname", ""),
                    template: "$$$",
                    renderTemplate: "In the remembrance of <b>{name}</b>",
                }
            }),
            new TagRendering_1.TagRenderingOptions({
                question: "When was the ghost bike installed?",
                freeform: {
                    key: "start_date",
                    template: "The ghost bike was placed on $$$",
                    renderTemplate: "The ghost bike was placed on <b>{start_date}</b>",
                }
            }),
            new TagRendering_1.TagRenderingOptions({
                question: "On what URL can more information be found?" +
                    "<span class='question-subtext'>If available, add a link to a news report about the accident or about the placing of the ghost bike</span>",
                freeform: {
                    key: "source",
                    template: "More information available on $$$",
                    renderTemplate: "<a href='{source}' target='_blank'>More information</a>",
                }
            }),
        ];
        _this.style = function (tags) {
            return {
                color: "#000000",
                icon: leaflet_1.default.icon({
                    iconUrl: 'assets/bike/ghost.svg',
                    iconSize: [40, 40],
                    iconAnchor: [20, 20],
                })
            };
        };
        return _this;
    }
    return GhostBike;
}(LayerDefinition_1.LayerDefinition));
exports.GhostBike = GhostBike;
