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
var ParkingType = /** @class */ (function (_super) {
    __extends(ParkingType, _super);
    function ParkingType() {
        return _super.call(this, {
            priority: 5,
            question: "Van welk type is deze fietsenparking?",
            freeform: {
                key: "bicycle_parking",
                extraTags: new TagsFilter_1.Tag("fixme", "Freeform bicycle_parking= tag used: possibly a wrong value"),
                template: "Iets anders: $$$",
                renderTemplate: "Dit is een fietsenparking van het type: {bicycle_parking}",
                placeholder: "Specifieer"
            },
            mappings: [
                { k: new TagsFilter_1.Tag("bicycle_parking", "stands"), txt: ParkingType.toImgTxt(ParkingType.images.stands) },
                { k: new TagsFilter_1.Tag("bicycle_parking", "wall_loops"), txt: ParkingType.toImgTxt(ParkingType.images.wall_loops) },
                { k: new TagsFilter_1.Tag("bicycle_parking", "handlebar_holder"), txt: ParkingType.toImgTxt(ParkingType.images.handlebar_holder) },
                { k: new TagsFilter_1.Tag("bicycle_parking", "shed"), txt: ParkingType.toImgTxt(ParkingType.images.shed) },
                { k: new TagsFilter_1.Tag("bicycle_parking", "two-tier"), txt: ParkingType.toImgTxt(ParkingType.images["two-tier"]) }
            ]
        }) || this;
    }
    ParkingType.toImgTxt = function (url) {
        return "<img src=" + url + ">";
    };
    ParkingType.images = {
        stands: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Bike_racks_at_north-west_of_Westfield_-_geograph.org.uk_-_1041057.jpg/100px-Bike_racks_at_north-west_of_Westfield_-_geograph.org.uk_-_1041057.jpg",
        wall_loops: "https://wiki.openstreetmap.org/w/images/thumb/c/c2/Bike-parking-wheelbender.jpg/100px-Bike-parking-wheelbender.jpg",
        handlebar_holder: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Bicycle_parking_handlebar_holder.jpg/100px-Bicycle_parking_handlebar_holder.jpg",
        shed: "https://wiki.openstreetmap.org/w/images/thumb/b/b2/Bike-shelter.jpg/100px-Bike-shelter.jpg",
        "two-tier": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Bicis_a_l%27estaci%C3%B3_de_Leiden.JPG/100px-Bicis_a_l%27estaci%C3%B3_de_Leiden.JPG"
    };
    return ParkingType;
}(TagRendering_1.TagRenderingOptions));
exports.default = ParkingType;
