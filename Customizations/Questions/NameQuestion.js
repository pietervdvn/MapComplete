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
exports.NameQuestion = void 0;
/**
 * There are two ways to ask for names:
 * One is a big 'name-question', the other is the 'edit name' in the title.
 * THis one is the big question
 */
var TagRendering_1 = require("../TagRendering");
var TagsFilter_1 = require("../../Logic/TagsFilter");
var NameQuestion = /** @class */ (function (_super) {
    __extends(NameQuestion, _super);
    function NameQuestion() {
        return _super.call(this, NameQuestion.options) || this;
    }
    NameQuestion.options = {
        priority: 10,
        question: "Wat is de <i>officiële</i> naam van dit gebied?<br><span class='question-subtext'>" +
            "Zelf een naam bedenken wordt afgeraden.<br/>" +
            "Een beschrijving van het gebied geven kan in een volgende stap.<br/>" +
            "</span>",
        freeform: {
            key: "name",
            template: "De naam is $$$",
            renderTemplate: "",
            placeholder: "",
            extraTags: new TagsFilter_1.Tag("noname", "")
        },
        mappings: [
            { k: new TagsFilter_1.Tag("noname", "yes"), txt: "Dit gebied heeft geen naam" },
        ]
    };
    return NameQuestion;
}(TagRendering_1.TagRenderingOptions));
exports.NameQuestion = NameQuestion;
