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
exports.GrbToFix = void 0;
var LayerDefinition_1 = require("../LayerDefinition");
var leaflet_1 = require("leaflet");
var TagsFilter_1 = require("../../Logic/TagsFilter");
var TagRendering_1 = require("../TagRendering");
var GrbToFix = /** @class */ (function (_super) {
    __extends(GrbToFix, _super);
    function GrbToFix() {
        var _this = _super.call(this) || this;
        _this.name = "grb";
        _this.newElementTags = undefined;
        _this.icon = "./assets/star.svg";
        _this.overpassFilter = new TagsFilter_1.Regex("fixme", "GRB");
        _this.minzoom = 13;
        _this.style = function (tags) {
            return {
                icon: new leaflet_1.default.icon({
                    iconUrl: "assets/star.svg",
                    iconSize: [40, 40],
                    text: "hi"
                }),
                color: "#ff0000"
            };
        };
        _this.title = new TagRendering_1.TagRenderingOptions({
            freeform: {
                key: "fixme",
                renderTemplate: "{fixme}",
                template: "Fixme $$$"
            }
        });
        _this.elementsToShow = [
            new TagRendering_1.TagRenderingOptions({
                freeform: {
                    key: "addr:street",
                    renderTemplate: "Het adres is {addr:street} <b>{addr:housenumber}</b>",
                    template: "Straat? $$$"
                }
            }),
            new TagRendering_1.TagRenderingOptions({
                question: "Wat is het huisnummer?",
                tagsPreprocessor: function (tags) {
                    var telltale = "GRB thinks that this has number ";
                    var index = tags.fixme.indexOf(telltale);
                    if (index >= 0) {
                        var housenumber = tags.fixme.slice(index + telltale.length);
                        tags["grb:housenumber:human"] = housenumber;
                        tags["grb:housenumber"] = housenumber == "no number" ? "" : housenumber;
                    }
                },
                freeform: {
                    key: "addr:housenumber",
                    template: "Het huisnummer is $$$",
                    renderTemplate: "Het huisnummer is <b>{addr:housenumber}</b>, GRB denkt <i>{grb:housenumber:human}</i>",
                    extraTags: new TagsFilter_1.Tag("fixme", "")
                },
                mappings: [
                    {
                        k: new TagsFilter_1.And([new TagsFilter_1.Tag("addr:housenumber", "{grb:housenumber}"), new TagsFilter_1.Tag("fixme", "")]),
                        txt: "Volg GRB: <b>{grb:housenumber:human}</b>",
                        substitute: true
                    },
                    {
                        k: new TagsFilter_1.And([new TagsFilter_1.Tag("addr:housenumber", "{addr:housenumber}"), new TagsFilter_1.Tag("fixme", "")]),
                        txt: "Volg OSM: <b>{addr:housenumber}</b>",
                        substitute: true
                    }
                ]
            })
        ];
        return _this;
    }
    return GrbToFix;
}(LayerDefinition_1.LayerDefinition));
exports.GrbToFix = GrbToFix;
