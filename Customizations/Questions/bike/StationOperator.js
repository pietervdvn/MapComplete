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
var BikeStationOperator = /** @class */ (function (_super) {
    __extends(BikeStationOperator, _super);
    function BikeStationOperator() {
        return _super.call(this, {
            priority: 15,
            question: "Who operates this bike station (name of university, shop, city...)?",
            freeform: {
                key: "operator",
                template: "This bike station is operated by $$$",
                renderTemplate: "This bike station is operated by {operator}",
                placeholder: "organisatie"
            },
            mappings: [
                { k: new TagsFilter_1.Tag("operator", "KU Leuven"), txt: "KU Leuven" },
                { k: new TagsFilter_1.Tag("operator", "Stad Halle"), txt: "Stad Halle" },
                { k: new TagsFilter_1.Tag("operator", "Saint Gilles - Sint Gillis"), txt: "Saint Gilles - Sint Gillis" },
                { k: new TagsFilter_1.Tag("operator", "Jette"), txt: "Jette" },
                { k: new TagsFilter_1.Tag("operator", "private"), txt: "Beheer door een privépersoon" }
            ]
        }) || this;
    }
    return BikeStationOperator;
}(TagRendering_1.TagRenderingOptions));
exports.default = BikeStationOperator;
