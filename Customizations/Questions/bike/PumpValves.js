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
var PumpValves = /** @class */ (function (_super) {
    __extends(PumpValves, _super);
    function PumpValves() {
        return _super.call(this, {
            question: "What valves are supported?",
            mappings: [
                {
                    k: new TagsFilter_1.Tag("valves", " sclaverand;schrader;dunlop"),
                    txt: "There is a default head, so Presta, Dunlop and Auto"
                },
                { k: new TagsFilter_1.Tag("valves", "dunlop"), txt: "Only dunlop" },
                { k: new TagsFilter_1.Tag("valves", "sclaverand"), txt: "Only Sclaverand (also known as Dunlop)" },
                { k: new TagsFilter_1.Tag("valves", "auto"), txt: "Only auto" },
            ],
            freeform: {
                key: "valves",
                template: "Supported valves are $$$",
                renderTemplate: "Supported valves are {valves}"
            }
        }) || this;
    }
    return PumpValves;
}(TagRendering_1.TagRenderingOptions));
exports.default = PumpValves;
