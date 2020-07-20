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
var BikeStationStand = /** @class */ (function (_super) {
    __extends(BikeStationStand, _super);
    function BikeStationStand() {
        return _super.call(this, {
            priority: 10,
            question: "Does this bike station have a hook to suspend your bike with or a stand to elevate it?",
            mappings: [
                { k: new TagsFilter_1.Tag("service:bicycle:stand", "yes"), txt: "There is a hook or stand." },
                { k: new TagsFilter_1.Tag("service:bicycle:stand", "no"), txt: "There is no hook or stand" },
            ]
        }) || this;
    }
    return BikeStationStand;
}(TagRendering_1.TagRenderingOptions));
exports.default = BikeStationStand;
