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
exports.Map = void 0;
var LayerDefinition_1 = require("../LayerDefinition");
var FixedText_1 = require("../Questions/FixedText");
var ImageCarouselWithUpload_1 = require("../../UI/Image/ImageCarouselWithUpload");
var TagRendering_1 = require("../TagRendering");
var TagsFilter_1 = require("../../Logic/TagsFilter");
var leaflet_1 = require("leaflet");
var Map = /** @class */ (function (_super) {
    __extends(Map, _super);
    function Map() {
        var _this = _super.call(this) || this;
        _this.name = "Map";
        _this.title = new FixedText_1.default("Map");
        _this.minzoom = 12;
        _this.overpassFilter = new TagsFilter_1.Tag("information", "map");
        _this.newElementTags = [new TagsFilter_1.Tag("tourism", "information"), new TagsFilter_1.Tag("information", "map")];
        var isOsmSource = new TagsFilter_1.Tag("map_source", "OpenStreetMap");
        _this.style = function (properties) {
            var icon = "assets/map.svg";
            if (isOsmSource.matchesProperties(properties)) {
                icon = "assets/osm-logo-white-bg.svg";
                var attr = properties["map_source:attribution"];
                if (attr == "sticker") {
                    icon = "assets/map-stickered.svg";
                }
                else if (attr == "no") {
                    icon = "assets/osm-logo-buggy-attr.svg";
                }
            }
            return {
                color: "#000000",
                icon: leaflet_1.default.icon({
                    iconUrl: icon,
                    iconSize: [50, 50]
                })
            };
        };
        _this.elementsToShow = [
            new ImageCarouselWithUpload_1.ImageCarouselWithUploadConstructor(),
            new TagRendering_1.TagRenderingOptions({
                question: "Is this map based on OpenStreetMap?",
                mappings: [
                    {
                        k: isOsmSource,
                        txt: "This map is based on OpenStreetMap"
                    },
                ],
                freeform: {
                    key: "map_source",
                    renderTemplate: "The map data is based on {map_source}",
                    template: "The map data is based on $$$"
                }
            }),
            new TagRendering_1.TagRenderingOptions({
                question: "Is the attribution present?",
                mappings: [
                    {
                        k: new TagsFilter_1.Tag("map_source:attribution", "yes"),
                        txt: "OpenStreetMap is clearly attribute, including the ODBL-license"
                    },
                    {
                        k: new TagsFilter_1.Tag("map_source:attribution", "incomplete"),
                        txt: "OpenStreetMap is clearly attribute, but the license is not mentioned"
                    },
                    {
                        k: new TagsFilter_1.Tag("map_source:attribution", "sticker"),
                        txt: "OpenStreetMap wasn't mentioned, but someone put an OpenStreetMap-sticker on it"
                    },
                    {
                        k: new TagsFilter_1.Tag("map_source:attribution", "no"),
                        txt: "There is no attribution at all"
                    },
                    {
                        k: new TagsFilter_1.Tag("map_source:attribution", "none"),
                        txt: "There is no attribution at all"
                    }
                ]
            }).OnlyShowIf(new TagsFilter_1.Tag("map_source", "OpenStreetMap"))
        ];
        return _this;
    }
    return Map;
}(LayerDefinition_1.LayerDefinition));
exports.Map = Map;
