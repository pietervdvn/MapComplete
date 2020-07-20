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
var BikeStationPumpTools = /** @class */ (function (_super) {
    __extends(BikeStationPumpTools, _super);
    function BikeStationPumpTools() {
        return _super.call(this, {
            priority: 15,
            question: "Which services are available at this bike station?",
            mappings: [
                { k: new TagsFilter_1.And([new TagsFilter_1.Tag("service:bicycle:tools", "no"), new TagsFilter_1.Tag("service:bicycle:pump", "yes")]), txt: "There is only a pump available." },
                { k: new TagsFilter_1.And([new TagsFilter_1.Tag("service:bicycle:tools", "yes"), new TagsFilter_1.Tag("service:bicycle:pump", "no")]), txt: "There are only tools (screwdrivers, pliers...) available." },
                { k: new TagsFilter_1.And([new TagsFilter_1.Tag("service:bicycle:tools", "yes"), new TagsFilter_1.Tag("service:bicycle:pump", "yes")]), txt: "There are both tools and a pump available." }
            ]
        }) || this;
    }
    return BikeStationPumpTools;
}(TagRendering_1.TagRenderingOptions));
exports.default = BikeStationPumpTools;
