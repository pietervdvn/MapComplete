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
exports.OperatorTag = void 0;
var TagRendering_1 = require("../TagRendering");
var TagsFilter_1 = require("../../Logic/TagsFilter");
var OperatorTag = /** @class */ (function (_super) {
    __extends(OperatorTag, _super);
    function OperatorTag() {
        return _super.call(this, OperatorTag.options) || this;
    }
    OperatorTag.options = {
        priority: 15,
        question: "Wie beheert dit gebied?",
        freeform: {
            key: "operator",
            template: "Dit gebied wordt beheerd door $$$",
            renderTemplate: "Dit gebied wordt beheerd door {operator}",
            placeholder: "organisatie"
        },
        mappings: [
            { k: new TagsFilter_1.Tag("operator", "Natuurpunt"), txt: "Natuurpunt" },
            { k: new TagsFilter_1.Tag("operator", "Agentschap Natuur en Bos"), txt: "het Agentschap Natuur en Bos (ANB)" },
            { k: new TagsFilter_1.Tag("operator", "private"), txt: "Beheer door een privépersoon" }
        ]
    };
    return OperatorTag;
}(TagRendering_1.TagRenderingOptions));
exports.OperatorTag = OperatorTag;
