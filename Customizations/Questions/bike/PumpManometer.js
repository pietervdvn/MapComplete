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
var TagRendering_1 = require("../../TagRendering");
var TagsFilter_1 = require("../../../Logic/TagsFilter");
var PumpManometer = /** @class */ (function (_super) {
    __extends(PumpManometer, _super);
    function PumpManometer() {
        return _super.call(this, {
            question: "Does the pump have a pressure indicator or manometer?",
            mappings: [
                { k: new TagsFilter_1.Tag("manometer", "yes"), txt: "Yes, there is a manometer" },
                { k: new TagsFilter_1.Tag("manometer", "broken"), txt: "Yes, but it is broken" },
                { k: new TagsFilter_1.Tag("manometer", "yes"), txt: "No" }
            ]
        }) || this;
    }
    return PumpManometer;
}(TagRendering_1.TagRenderingOptions));
exports.default = PumpManometer;
