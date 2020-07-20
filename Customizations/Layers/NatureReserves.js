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
exports.NatureReserves = void 0;
var LayerDefinition_1 = require("../LayerDefinition");
var TagsFilter_1 = require("../../Logic/TagsFilter");
var TagRendering_1 = require("../TagRendering");
var AccessTag_1 = require("../Questions/AccessTag");
var OperatorTag_1 = require("../Questions/OperatorTag");
var NameQuestion_1 = require("../Questions/NameQuestion");
var NameInline_1 = require("../Questions/NameInline");
var DescriptionQuestion_1 = require("../Questions/DescriptionQuestion");
var ImageCarouselWithUpload_1 = require("../../UI/Image/ImageCarouselWithUpload");
var NatureReserves = /** @class */ (function (_super) {
    __extends(NatureReserves, _super);
    function NatureReserves(moreQuests) {
        if (moreQuests === void 0) { moreQuests = false; }
        var _this = _super.call(this) || this;
        _this.name = "natuurgebied";
        _this.icon = "./assets/tree_white_background.svg";
        _this.overpassFilter =
            new TagsFilter_1.Or([new TagsFilter_1.Tag("leisure", "nature_reserve"), new TagsFilter_1.Tag("boundary", "protected_area")]);
        _this.maxAllowedOverlapPercentage = 10;
        _this.newElementTags = [new TagsFilter_1.Tag("leisure", "nature_reserve"),
            new TagsFilter_1.Tag("fixme", "Toegevoegd met MapComplete, geometry nog uit te tekenen")];
        _this.minzoom = 13;
        _this.title = new NameInline_1.NameInline("natuurreservaat");
        _this.style = _this.generateStyleFunction();
        _this.elementsToShow = [
            new ImageCarouselWithUpload_1.ImageCarouselWithUploadConstructor(),
            new NameQuestion_1.NameQuestion(),
            new AccessTag_1.AccessTag(),
            new OperatorTag_1.OperatorTag(),
            new DescriptionQuestion_1.DescriptionQuestion("natuurgebied")
        ];
        var extraRenderings = [
            new TagRendering_1.TagRenderingOptions({
                question: "Mogen honden in dit natuurgebied?",
                mappings: [
                    { k: new TagsFilter_1.Tag("dog", "leashed"), txt: "Honden moeten aan de leiband" },
                    { k: new TagsFilter_1.Tag("dog", "no"), txt: "Honden zijn niet toegestaan" },
                    { k: new TagsFilter_1.Tag("dog", "yes"), txt: "Honden zijn welkom" },
                ]
            }).OnlyShowIf(new TagsFilter_1.Tag("access", "yes")),
            new TagRendering_1.TagRenderingOptions({
                question: "Op welke website kunnen we meer informatie vinden over dit natuurgebied?",
                freeform: {
                    key: "website",
                    renderTemplate: "<a href='{website}' target='_blank'>Meer informatie</a>",
                    template: "$$$"
                }
            }),
            new TagRendering_1.TagRenderingOptions({
                question: "Wie is de conservator van dit gebied?<br>" +
                    "<span class='question-subtext'>Geef de naam van de conservator énkel als die duidelijk online staat gepubliceerd.</span>",
                freeform: {
                    renderTemplate: "De conservator van dit gebied is {curator}",
                    template: "$$$",
                    key: "curator"
                }
            }),
            new TagRendering_1.TagRenderingOptions({
                question: "Wat is het email-adres van de beheerder?<br>" +
                    "<span class='question-subtext'>Geef bij voorkeur het emailadres van de Natuurpunt-afdeling; geef enkel een email-adres van de conservator als dit duidelijk is gepubliceerd</span>",
                freeform: {
                    renderTemplate: "Bij problemen of vragen, de conservator kan bereikt worden via " +
                        "<a href='mailto:{email}'>{email}</a>",
                    template: "$$$",
                    key: "email"
                }
            }),
            new TagRendering_1.TagRenderingOptions({
                question: "Wat is het telefoonnummer van de beheerder?<br>" +
                    "<span class='question-subtext'>Geef bij voorkeur het telefoonnummer van de Natuurpunt-afdeling; geef enkel een email-adres van de conservator als dit duidelijk is gepubliceerd</span>",
                freeform: {
                    renderTemplate: "Bij problemen of vragen, de {conservator} kan bereikt worden via " +
                        "<a href='tel:{phone}'>{phone}</a>",
                    template: "$$$",
                    key: "phone"
                }
            }),
        ];
        if (moreQuests) {
            _this.elementsToShow =
                _this.elementsToShow.concat(extraRenderings);
        }
        return _this;
    }
    NatureReserves.prototype.generateStyleFunction = function () {
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
    return NatureReserves;
}(LayerDefinition_1.LayerDefinition));
exports.NatureReserves = NatureReserves;
