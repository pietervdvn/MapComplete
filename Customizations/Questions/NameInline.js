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
exports.NameInline = void 0;
var TagRendering_1 = require("../TagRendering");
var TagsFilter_1 = require("../../Logic/TagsFilter");
var NameInline = /** @class */ (function (_super) {
    __extends(NameInline, _super);
    function NameInline(category) {
        return _super.call(this, {
            question: "",
            freeform: {
                renderTemplate: "{name}",
                template: "De naam van dit " + category + " is $$$",
                key: "name",
                extraTags: new TagsFilter_1.Tag("noname", "") // Remove 'noname=yes'
            },
            mappings: [
                { k: new TagsFilter_1.Tag("noname", "yes"), txt: NameInline.Upper(category) + " zonder naam" },
                { k: null, txt: NameInline.Upper(category) }
            ]
        }) || this;
    }
    NameInline.Upper = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
    return NameInline;
}(TagRendering_1.TagRenderingOptions));
exports.NameInline = NameInline;
