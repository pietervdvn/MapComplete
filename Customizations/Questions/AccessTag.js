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
exports.AccessTag = void 0;
var TagRendering_1 = require("../TagRendering");
var TagsFilter_1 = require("../../Logic/TagsFilter");
var AccessTag = /** @class */ (function (_super) {
    __extends(AccessTag, _super);
    function AccessTag() {
        return _super.call(this, AccessTag.options) || this;
    }
    AccessTag.options = {
        priority: 20,
        question: "Is dit gebied toegankelijk?",
        primer: "Dit gebied is ",
        freeform: {
            key: "access:description",
            template: "Iets anders: $$$",
            renderTemplate: "De toegankelijkheid van dit gebied is: {access:description}",
            placeholder: "Specifieer"
        },
        mappings: [
            { k: new TagsFilter_1.And([new TagsFilter_1.Tag("access", "yes"), new TagsFilter_1.Tag("fee", "")]), txt: "publiek toegankelijk" },
            { k: new TagsFilter_1.And([new TagsFilter_1.Tag("access", "no"), new TagsFilter_1.Tag("fee", "")]), txt: "niet toegankelijk" },
            { k: new TagsFilter_1.And([new TagsFilter_1.Tag("access", "private"), new TagsFilter_1.Tag("fee", "")]), txt: "niet toegankelijk, want privegebied" },
            { k: new TagsFilter_1.And([new TagsFilter_1.Tag("access", "permissive"), new TagsFilter_1.Tag("fee", "")]), txt: "toegankelijk, maar het is privegebied" },
            { k: new TagsFilter_1.And([new TagsFilter_1.Tag("access", "guided"), new TagsFilter_1.Tag("fee", "")]), txt: "enkel met gids of op activiteit" },
            {
                k: new TagsFilter_1.And([new TagsFilter_1.Tag("access", "yes"),
                    new TagsFilter_1.Tag("fee", "yes")]),
                txt: "toegankelijk mits betaling",
                priority: 10
            },
        ]
    };
    return AccessTag;
}(TagRendering_1.TagRenderingOptions));
exports.AccessTag = AccessTag;
