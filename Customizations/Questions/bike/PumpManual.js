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
var PumpManual = /** @class */ (function (_super) {
    __extends(PumpManual, _super);
    function PumpManual() {
        return _super.call(this, {
            priority: 5,
            question: "Is this an electric bike pump?",
            mappings: [
                { k: new TagsFilter_1.Tag("manual", "yes"), txt: "Manual pump" },
                { k: new TagsFilter_1.Tag("manual", "no"), txt: "Electric pump" }
            ]
        }) || this;
    }
    return PumpManual;
}(TagRendering_1.TagRenderingOptions));
exports.default = PumpManual;
