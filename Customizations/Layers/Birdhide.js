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
exports.Birdhide = void 0;
var LayerDefinition_1 = require("../LayerDefinition");
var TagsFilter_1 = require("../../Logic/TagsFilter");
var TagRendering_1 = require("../TagRendering");
var FixedText_1 = require("../Questions/FixedText");
var ImageCarouselWithUpload_1 = require("../../UI/Image/ImageCarouselWithUpload");
var leaflet_1 = require("leaflet");
var Birdhide = /** @class */ (function (_super) {
    __extends(Birdhide, _super);
    function Birdhide() {
        var _this = _super.call(this, {
            name: "vogelkijkplaats",
            overpassFilter: Birdhide.birdhide,
            elementsToShow: [new FixedText_1.default("hi")],
            icon: "assets/nature/birdhide.svg",
            minzoom: 12,
            newElementTags: [Birdhide.birdhide],
            style: function (tags) {
                return { color: "", icon: undefined };
            },
        }) || this;
        function rmStart(toRemove, title) {
            if (title.toLowerCase().indexOf(toRemove.toLowerCase()) == 0) {
                return title.substr(toRemove.length).trim();
            }
            return title;
        }
        function rmStarts(toRemove, title) {
            for (var _i = 0, toRemove_1 = toRemove; _i < toRemove_1.length; _i++) {
                var toRm = toRemove_1[_i];
                title = rmStart(toRm, title);
            }
            return title;
        }
        _this.title = new TagRendering_1.TagRenderingOptions({
            tagsPreprocessor: function (tags) {
                if (tags.name) {
                    var nm = rmStarts(["Vogelkijkhut", "Vogelkijkwand", "Kijkwand", "Kijkhut"], tags.name);
                    tags.name = " '" + nm + "'";
                }
                else {
                    tags.name = "";
                }
            },
            mappings: [
                {
                    k: new TagsFilter_1.And([new TagsFilter_1.Tag("shelter", "no"), new TagsFilter_1.Tag("building", "")]),
                    txt: "Vogelkijkwand{name}"
                },
                {
                    k: new TagsFilter_1.And([new TagsFilter_1.Tag("amenity", "shelter"), new TagsFilter_1.Tag("building", "yes")]),
                    txt: "Vogelijkhut{name}"
                },
                {
                    k: new TagsFilter_1.Tag("amenity", "shelter"),
                    txt: "Vogelijkhut{name}"
                },
                {
                    k: new TagsFilter_1.Tag("building", "yes"),
                    txt: "Vogelijkhut{name}"
                },
                { k: null, txt: "Vogelkijkplaats{name}" }
            ]
        });
        _this.style = function (properties) {
            var icon = "assets/nature/birdhide.svg";
            if (new TagsFilter_1.Or([new TagsFilter_1.Tag("amenity", "shelter"), new TagsFilter_1.Tag("building", "yes"), new TagsFilter_1.Tag("shelter", "yes")]).matchesProperties(properties)) {
                icon = "assets/nature/birdshelter.svg";
            }
            return {
                color: "#0000bb",
                icon: leaflet_1.default.icon({
                    iconUrl: icon,
                    iconSize: [40, 40],
                    iconAnchor: [20, 20]
                })
            };
        };
        _this.elementsToShow = [
            new ImageCarouselWithUpload_1.ImageCarouselWithUploadConstructor(),
            new TagRendering_1.TagRenderingOptions({
                question: "Is dit een kijkwand of kijkhut?",
                mappings: [
                    {
                        k: new TagsFilter_1.And([new TagsFilter_1.Tag("shelter", "no"), new TagsFilter_1.Tag("building", ""), new TagsFilter_1.Tag("amenity", "")]),
                        txt: "Vogelkijkwand"
                    },
                    {
                        k: new TagsFilter_1.And([new TagsFilter_1.Tag("amenity", "shelter"), new TagsFilter_1.Tag("building", "yes"), new TagsFilter_1.Tag("shelter", "yes")]),
                        txt: "Vogelijkhut"
                    }
                ]
            }),
            new TagRendering_1.TagRenderingOptions({
                question: "Is ze rolstoeltoegankelijk?",
                mappings: [
                    {
                        k: new TagsFilter_1.Tag("wheelchair", "no"),
                        txt: "Niet rolstoeltoegankelijk"
                    },
                    {
                        k: new TagsFilter_1.Tag("wheelchair", "limited"),
                        txt: "Een rolstoel raakt er, maar het is niet makkelijk"
                    },
                    {
                        k: new TagsFilter_1.Tag("wheelchair", "yes"),
                        txt: "Een rolstoel raakt er gemakkelijk"
                    }
                ]
            }),
            new TagRendering_1.TagRenderingOptions({
                question: "Wie beheert deze?",
                freeform: {
                    key: "operator",
                    template: "Beheer door $$$",
                    renderTemplate: "Beheer door {operator}",
                    placeholder: "organisatie"
                },
                mappings: [
                    { k: new TagsFilter_1.Tag("operator", "Natuurpunt"), txt: "Natuurpunt" },
                    { k: new TagsFilter_1.Tag("operator", "Agentschap Natuur en Bos"), txt: "het Agentschap Natuur en Bos (ANB)" },
                ]
            })
        ];
        return _this;
    }
    Birdhide.birdhide = new TagsFilter_1.Tag("leisure", "bird_hide");
    return Birdhide;
}(LayerDefinition_1.LayerDefinition));
exports.Birdhide = Birdhide;
