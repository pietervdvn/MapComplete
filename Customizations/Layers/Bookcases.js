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
exports.Bookcases = void 0;
var LayerDefinition_1 = require("../LayerDefinition");
var leaflet_1 = require("leaflet");
var TagsFilter_1 = require("../../Logic/TagsFilter");
var TagRendering_1 = require("../TagRendering");
var NameInline_1 = require("../Questions/NameInline");
var ImageCarouselWithUpload_1 = require("../../UI/Image/ImageCarouselWithUpload");
var Bookcases = /** @class */ (function (_super) {
    __extends(Bookcases, _super);
    function Bookcases() {
        var _this = _super.call(this) || this;
        _this.name = "boekenkast";
        _this.newElementTags = [new TagsFilter_1.Tag("amenity", "public_bookcase")];
        _this.icon = "./assets/bookcase.svg";
        _this.overpassFilter = new TagsFilter_1.Tag("amenity", "public_bookcase");
        _this.minzoom = 11;
        _this.title = new NameInline_1.NameInline("ruilboekenkastje");
        _this.elementsToShow = [
            new ImageCarouselWithUpload_1.ImageCarouselWithUploadConstructor(),
            new TagRendering_1.TagRenderingOptions({
                question: "Heeft dit boekenruilkastje een naam?",
                freeform: {
                    key: "name",
                    template: "De naam is $$$",
                    renderTemplate: "",
                    placeholder: "",
                    extraTags: new TagsFilter_1.Tag("noname", "")
                },
                mappings: [
                    { k: new TagsFilter_1.Tag("noname", "yes"), txt: "Neen, er is geen naam aangeduid op het boekenruilkastje" },
                ]
            }),
            new TagRendering_1.TagRenderingOptions({
                question: "Hoeveel boeken passen in dit boekenruilkastje?",
                freeform: {
                    renderTemplate: "Er passen {capacity} boeken in dit boekenruilkastje",
                    template: "Er passen $$$ boeken in dit boekenruilkastje",
                    key: "capacity",
                    placeholder: "aantal"
                },
            }),
            new TagRendering_1.TagRenderingOptions({
                question: "Wat voor soort boeken heeft dit boekenruilkastje?",
                mappings: [
                    { k: new TagsFilter_1.Tag("books", "children"), txt: "Voornamelijk kinderboeken" },
                    { k: new TagsFilter_1.Tag("books", "adults"), txt: "Voornamelijk boeken voor volwassenen" },
                    { k: new TagsFilter_1.Tag("books", "children;adults"), txt: "Zowel kinderboeken als boeken voor volwassenen" }
                ],
            }),
            new TagRendering_1.TagRenderingOptions({
                question: "Staat dit boekenruilkastje binnen of buiten?",
                mappings: [
                    { k: new TagsFilter_1.Tag("indoor", "yes"), txt: "Dit boekenruilkastje staat binnen" },
                    { k: new TagsFilter_1.Tag("indoor", "no"), txt: "Dit boekenruilkastje staat buiten" },
                    { k: new TagsFilter_1.Tag("indoor", ""), txt: "Dit boekenruilkastje staat buiten" }
                ]
            }),
            new TagRendering_1.TagRenderingOptions({
                question: "Is dit boekenruilkastje vrij toegankelijk?",
                mappings: [
                    { k: new TagsFilter_1.Tag("access", "yes"), txt: "Ja, vrij toegankelijk" },
                    { k: new TagsFilter_1.Tag("access", "customers"), txt: "Enkel voor klanten" },
                ]
            }).OnlyShowIf(new TagsFilter_1.Tag("indoor", "yes")),
            new TagRendering_1.TagRenderingOptions({
                question: "Wie (welke organisatie) beheert dit boekenruilkastje?",
                freeform: {
                    key: "opeartor",
                    renderTemplate: "Dit boekenruilkastje wordt beheerd door {operator}",
                    template: "Dit boekenruilkastje wordt beheerd door $$$"
                }
            }),
            new TagRendering_1.TagRenderingOptions({
                question: "Zijn er openingsuren voor dit boekenruilkastje?",
                mappings: [
                    { k: new TagsFilter_1.Tag("opening_hours", "24/7"), txt: "Dag en nacht toegankelijk" },
                    { k: new TagsFilter_1.Tag("opening_hours", ""), txt: "Dag en nacht toegankelijk" },
                    { k: new TagsFilter_1.Tag("opening_hours", "sunrise-sunset"), txt: "Van zonsopgang tot zonsondergang" },
                ],
                freeform: {
                    key: "opening_hours",
                    renderTemplate: "De openingsuren zijn {opening_hours}",
                    template: "De openingsuren zijn $$$"
                }
            }),
            new TagRendering_1.TagRenderingOptions({
                question: "Is dit boekenruilkastje deel van een netwerk?",
                freeform: {
                    key: "brand",
                    renderTemplate: "Deel van het netwerk {brand}",
                    template: "Deel van het netwerk $$$"
                },
                mappings: [{
                        k: new TagsFilter_1.And([new TagsFilter_1.Tag("brand", "Little Free Library"), new TagsFilter_1.Tag("nobrand", "")]),
                        txt: "Little Free Library"
                    },
                    {
                        k: new TagsFilter_1.And([new TagsFilter_1.Tag("brand", ""), new TagsFilter_1.Tag("nobrand", "yes")]),
                        txt: "Maakt geen deel uit van een groter netwerk"
                    }]
            }).OnlyShowIf(new TagsFilter_1.Or([
                new TagsFilter_1.Tag("ref", ""),
                new TagsFilter_1.And([new TagsFilter_1.Tag("ref", "*"), new TagsFilter_1.Tag("brand", "")])
            ])),
            new TagRendering_1.TagRenderingOptions({
                question: "Wat is het referentienummer van dit boekenruilkastje?",
                freeform: {
                    key: "ref",
                    template: "Het referentienummer is $$$",
                    renderTemplate: "Gekend als {brand} <b>{ref}</b>"
                }
            }).OnlyShowIf(new TagsFilter_1.Tag("brand", "*")),
            new TagRendering_1.TagRenderingOptions({
                question: "Wanneer werd dit boekenruilkastje geinstalleerd?",
                priority: -1,
                freeform: {
                    key: "start_date",
                    renderTemplate: "Geplaatst op {start_date}",
                    template: "Geplaatst op $$$"
                }
            }),
            new TagRendering_1.TagRenderingOptions({
                question: "Is er een website waar we er meer informatie is over dit boekenruilkastje?",
                freeform: {
                    key: "website",
                    renderTemplate: "<a href='{website}' target='_blank'>Meer informatie over dit boekenruilkastje</a>",
                    template: "$$$",
                    placeholder: "website"
                }
            }),
            new TagRendering_1.TagRenderingOptions({
                freeform: {
                    key: "description",
                    renderTemplate: "<b>Beschrijving door de uitbater:</b><br>{description}",
                    template: "$$$",
                }
            })
        ];
        _this.style = function (tags) {
            return {
                icon: new leaflet_1.default.icon({
                    iconUrl: "assets/bookcase.svg",
                    iconSize: [40, 40]
                }),
                color: "#0000ff"
            };
        };
        return _this;
    }
    return Bookcases;
}(LayerDefinition_1.LayerDefinition));
exports.Bookcases = Bookcases;
