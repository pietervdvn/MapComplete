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
exports.OsmLink = void 0;
var TagRendering_1 = require("../TagRendering");
var Img_1 = require("../../UI/Img");
var TagsFilter_1 = require("../../Logic/TagsFilter");
var OsmLink = /** @class */ (function (_super) {
    __extends(OsmLink, _super);
    function OsmLink() {
        return _super.call(this, OsmLink.options) || this;
    }
    OsmLink.options = {
        freeform: {
            key: "id",
            template: "$$$",
            renderTemplate: "<span class='osmlink'><a href='https://osm.org/{id}' target='_blank'>" +
                Img_1.Img.osmAbstractLogo +
                "</a></span>",
            placeholder: "",
        },
        mappings: [
            { k: new TagsFilter_1.Tag("id", "node/-1"), txt: "<span class='alert'>Uploading</span>" }
        ]
    };
    return OsmLink;
}(TagRendering_1.TagRenderingOptions));
exports.OsmLink = OsmLink;
