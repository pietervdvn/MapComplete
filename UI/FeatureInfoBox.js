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
exports.FeatureInfoBox = void 0;
var UIElement_1 = require("./UIElement");
var VerticalCombine_1 = require("./Base/VerticalCombine");
var TagRendering_1 = require("../Customizations/TagRendering");
var OsmLink_1 = require("../Customizations/Questions/OsmLink");
var WikipediaLink_1 = require("../Customizations/Questions/WikipediaLink");
var TagsFilter_1 = require("../Logic/TagsFilter");
var FeatureInfoBox = /** @class */ (function (_super) {
    __extends(FeatureInfoBox, _super);
    function FeatureInfoBox(tagsES, title, elementsToShow, changes, userDetails) {
        var _this = _super.call(this, tagsES) || this;
        _this._tagsES = tagsES;
        _this._changes = changes;
        _this._userDetails = userDetails;
        _this.ListenTo(userDetails);
        var deps = { tags: _this._tagsES, changes: _this._changes };
        _this._infoboxes = [];
        elementsToShow = elementsToShow !== null && elementsToShow !== void 0 ? elementsToShow : [];
        for (var _i = 0, elementsToShow_1 = elementsToShow; _i < elementsToShow_1.length; _i++) {
            var tagRenderingOption = elementsToShow_1[_i];
            _this._infoboxes.push(tagRenderingOption.construct(deps));
        }
        title = title !== null && title !== void 0 ? title : new TagRendering_1.TagRenderingOptions({
            mappings: [{ k: new TagsFilter_1.And([]), txt: "" }]
        });
        _this._title = new TagRendering_1.TagRenderingOptions(title.options).construct(deps);
        _this._osmLink = new OsmLink_1.OsmLink().construct(deps);
        _this._wikipedialink = new WikipediaLink_1.WikipediaLink().construct(deps);
        return _this;
    }
    FeatureInfoBox.prototype.InnerRender = function () {
        var info = [];
        var questions = [];
        for (var _i = 0, _a = this._infoboxes; _i < _a.length; _i++) {
            var infobox = _a[_i];
            if (infobox.IsKnown()) {
                info.push(infobox);
            }
            else if (infobox.IsQuestioning()) {
                questions.push(infobox);
            }
        }
        var questionsHtml = "";
        if (this._userDetails.data.loggedIn && questions.length > 0) {
            // We select the most important question and render that one
            var mostImportantQuestion = void 0;
            var score = -1000;
            for (var _b = 0, questions_1 = questions; _b < questions_1.length; _b++) {
                var question = questions_1[_b];
                if (mostImportantQuestion === undefined || question.Priority() > score) {
                    mostImportantQuestion = question;
                    score = question.Priority();
                }
            }
            questionsHtml = mostImportantQuestion.Render();
        }
        return "<div class='featureinfobox'>" +
            "<div class='featureinfoboxtitle'>" +
            "<span>" +
            this._title.Render() +
            "</span>" +
            this._wikipedialink.Render() +
            this._osmLink.Render() +
            "</div>" +
            "<div class='infoboxcontents'>" +
            new VerticalCombine_1.VerticalCombine(info, "infobox-information ").Render() +
            questionsHtml +
            "</div>" +
            "" +
            "</div>";
    };
    return FeatureInfoBox;
}(UIElement_1.UIElement));
exports.FeatureInfoBox = FeatureInfoBox;
