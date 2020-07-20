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
var StationChain = /** @class */ (function (_super) {
    __extends(StationChain, _super);
    function StationChain() {
        return _super.call(this, {
            priority: 5,
            question: "Does this bike station have a special tool to repair your bike chain?",
            mappings: [
                { k: new TagsFilter_1.Tag("service:bicycle:chain_tool", "yes"), txt: "There is a chain tool." },
                { k: new TagsFilter_1.Tag("service:bicycle:chain_tool", "no"), txt: "There is no chain tool." },
            ]
        }) || this;
    }
    return StationChain;
}(TagRendering_1.TagRenderingOptions));
exports.default = StationChain;
